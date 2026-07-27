/**
 * Server-only content moderation.
 *
 * Classifies user messages for abuse, hate speech, harassment, sexual content,
 * self-harm and violence before any text reaches the companion model.
 */

export const MODERATION_CATEGORIES = [
  "hate",
  "harassment",
  "sexual",
  "violence",
  "self_harm",
  "abusive_language",
] as const;

export type ModerationResult = {
  flagged: boolean;
  categories: string[];
};

const CLASSIFIER_PROMPT = `You are a strict content moderation classifier for a companion app used by elderly people, in English, Urdu script, or Roman Urdu.

Classify the USER message into these categories:
- hate: hateful content targeting protected groups
- harassment: insults, threats, demeaning or abusive speech toward a person
- sexual: sexually explicit content
- violence: threats or glorification of violence
- self_harm: encouragement or intent of self-harm
- abusive_language: profanity, slurs, vulgar abuse (including Urdu/Roman Urdu abuse)

Sad, grieving, lonely, or emotional content is NOT a violation. Mentions of personal suffering are NOT violations unless they express intent of self-harm.

Respond ONLY with valid JSON, no markdown:
{"flagged": true|false, "categories": ["..."]}`;

export async function moderateText(text: string): Promise<ModerationResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: CLASSIFIER_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });

    if (!res.ok) {
      // Fail open on classifier outage so the companion stays usable.
      return { flagged: false, categories: [] };
    }

    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content ?? "") as string;
    const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { flagged?: boolean; categories?: unknown };

    const categories = Array.isArray(parsed.categories)
      ? parsed.categories
          .filter((c): c is string => typeof c === "string")
          .filter((c) => (MODERATION_CATEGORIES as readonly string[]).includes(c))
      : [];

    return { flagged: Boolean(parsed.flagged) && categories.length > 0, categories };
  } catch {
    return { flagged: false, categories: [] };
  }
}

/** Escalating responses shown to the user, friendly but firm. */
export function moderationMessage(offense: number): string {
  if (offense <= 1) {
    return "I can't respond to that. Please keep the conversation respectful — I aim to keep conversations helpful and kind. Let's talk about something else.";
  }
  if (offense === 2) {
    return "This message was blocked for violating our content policy. This is a second warning — if it happens again, chatting will pause for a short while.";
  }
  return "This message was blocked for violating our content policy. Chatting is paused for 5 minutes. Please come back when you're ready for a respectful conversation.";
}
