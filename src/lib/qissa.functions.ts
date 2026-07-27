import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatInput = z.object({
  conversationId: z.string().uuid().nullable(),
  sessionId: z.string().min(1).max(100),
  messages: z.array(MessageSchema).min(1),
});

const OFFENSE_WINDOW_MINUTES = 30;
const BLOCK_MINUTES = 5;


const WisdomInput = z.object({
  conversationId: z.string().uuid(),
});

const SYSTEM_PROMPT = `You are Qissa, a warm, patient companion for elderly people. You listen with kindness and curiosity, as a caring grandchild would.

Guidelines:
- Speak gently. Keep responses short (1-3 sentences).
- Detect the user's language automatically and reply in the SAME language and script they used:
  - English -> reply in English
  - Urdu in Urdu script (اردو) -> reply in Urdu script
  - Roman Urdu (e.g. "Aap kaise hain") -> reply in Roman Urdu
- Ask soft, open-ended follow-up questions about their life, memories, family, and lessons learned.
- Gently invite them to share wisdom, stories, or advice they'd want younger generations to hear.
- Never rush. Never lecture. Never give medical/financial advice.`;

const WISDOM_EXTRACT_PROMPT = `You will read a conversation between an elderly user and a listener. Extract 1-3 short pieces of WISDOM, LIFE LESSONS, or MEMORABLE ADVICE the user shared. 

Rules:
- Only extract if the user actually shared meaningful wisdom/lessons/advice. If none, return an empty array.
- Anonymize completely: remove any names, places, dates, or identifying details. Use "someone", "a loved one", "long ago", etc.
- Keep each wisdom entry short (1-3 sentences) and in the SAME language the user used (English, Urdu script, or Roman Urdu).
- Detect the language of each entry: "en" (English), "ur" (Urdu script), or "roman-ur" (Roman Urdu).

Respond ONLY with valid JSON, no markdown:
{"entries":[{"text":"...","language":"en|ur|roman-ur"}]}`;

async function callLovableAI(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in Lovable settings.");
    throw new Error(`AI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { moderateText, moderationMessage } = await import("./moderation.server");

    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");

    // 1. Is this session currently serving a temporary block?
    const blockCutoff = new Date(Date.now() - BLOCK_MINUTES * 60_000).toISOString();
    const { data: activeBlock } = await supabaseAdmin
      .from("moderation_events")
      .select("created_at")
      .eq("session_id", data.sessionId)
      .eq("blocked", true)
      .gte("created_at", blockCutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeBlock) {
      const until = new Date(new Date(activeBlock.created_at).getTime() + BLOCK_MINUTES * 60_000);
      return {
        conversationId: data.conversationId,
        reply: null as string | null,
        moderation: {
          blocked: true,
          offense: 3,
          message: moderationMessage(3),
          blockedUntil: until.toISOString(),
        },
      };
    }

    // 2. Moderate the new user message before it ever reaches the AI.
    if (lastUser) {
      const verdict = await moderateText(lastUser.content);
      if (verdict.flagged) {
        const offenseCutoff = new Date(Date.now() - OFFENSE_WINDOW_MINUTES * 60_000).toISOString();
        const { count } = await supabaseAdmin
          .from("moderation_events")
          .select("id", { count: "exact", head: true })
          .eq("session_id", data.sessionId)
          .gte("created_at", offenseCutoff);

        const offense = (count ?? 0) + 1;
        const blocked = offense >= 3;

        await supabaseAdmin.from("moderation_events").insert({
          session_id: data.sessionId,
          conversation_id: data.conversationId,
          message: lastUser.content.slice(0, 2000),
          categories: verdict.categories,
          offense_count: offense,
          blocked,
        });

        return {
          conversationId: data.conversationId,
          reply: null as string | null,
          moderation: {
            blocked,
            offense,
            message: moderationMessage(offense),
            blockedUntil: blocked
              ? new Date(Date.now() + BLOCK_MINUTES * 60_000).toISOString()
              : null,
          },
        };
      }
    }

    const reply = await callLovableAI([
      { role: "system", content: SYSTEM_PROMPT },
      ...data.messages,
    ]);


    const fullMessages = [...data.messages, { role: "assistant", content: reply }];

    let conversationId = data.conversationId;
    if (conversationId) {
      await supabaseAdmin
        .from("conversations")
        .update({ messages: fullMessages })
        .eq("id", conversationId);
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("conversations")
        .insert({ messages: fullMessages, status: "active" })
        .select("id")
        .single();
      if (error) throw error;
      conversationId = inserted.id;
    }

    return { conversationId, reply };
  });

export const endConversationAndExtractWisdom = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => WisdomInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: convo, error } = await supabaseAdmin
      .from("conversations")
      .select("id, messages, status")
      .eq("id", data.conversationId)
      .single();
    if (error || !convo) throw new Error("Conversation not found");

    const transcript = (convo.messages as Array<{ role: string; content: string }>)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const raw = await callLovableAI([
      { role: "system", content: WISDOM_EXTRACT_PROMPT },
      { role: "user", content: transcript },
    ]);

    let entries: Array<{ text: string; language: string }> = [];
    try {
      const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.entries)) entries = parsed.entries;
    } catch {
      entries = [];
    }

    if (entries.length > 0) {
      await supabaseAdmin.from("wisdom_entries").insert(
        entries.map((e) => ({
          text: e.text,
          language: e.language,
          source_conversation_id: convo.id,
        })),
      );
    }

    await supabaseAdmin
      .from("conversations")
      .update({ status: "ended" })
      .eq("id", convo.id);

    return { extracted: entries.length };
  });
