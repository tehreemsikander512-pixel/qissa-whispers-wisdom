import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { sendChatMessage, endConversationAndExtractWisdom } from "@/lib/qissa.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Qissa" },
      { name: "description", content: "Share your thoughts with Qissa in English or Urdu. A warm listener, always patient." },
      { property: "og:title", content: "Chat with Qissa" },
      { property: "og:description", content: "A warm AI companion who listens in English or Urdu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string; blocked?: boolean };

function getSessionId() {
  const KEY = "qissa-session-id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function ChatPage() {
  const send = useServerFn(sendChatMessage);
  const endChat = useServerFn(endConversationAndExtractWisdom);
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Assalam-o-Alaikum. I'm Qissa. What's on your mind today? You can speak to me in English, Urdu, or Roman Urdu — whichever feels natural." },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBlocked = blockedUntil !== null && blockedUntil > now;
  const secondsLeft = isBlocked ? Math.ceil((blockedUntil! - now) / 1000) : 0;

  useEffect(() => {
    if (blockedUntil === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [blockedUntil]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || isBlocked) return;
    setError(null);
    const nextUserMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextUserMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await send({
        data: {
          conversationId,
          sessionId: getSessionId(),
          messages: nextUserMsgs.map(({ role, content }) => ({ role, content })),
        },
      });

      if (res.moderation) {
        if (res.moderation.blockedUntil) {
          setBlockedUntil(new Date(res.moderation.blockedUntil).getTime());
          setNow(Date.now());
        }
        setMessages([
          ...nextUserMsgs,
          { role: "assistant", content: res.moderation.message, blocked: true },
        ]);
        return;
      }

      setConversationId(res.conversationId);
      setMessages([...nextUserMsgs, { role: "assistant", content: res.reply ?? "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  async function finishConversation() {
    if (!conversationId || ending) return;
    setEnding(true);
    try {
      await endChat({ data: { conversationId } });
      navigate({ to: "/wisdom" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save wisdom.");
      setEnding(false);
    }
  }


  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card/60 px-6 py-4 backdrop-blur">
        <Link to="/" className="font-serif text-xl">Qissa</Link>
        <button
          onClick={finishConversation}
          disabled={!conversationId || ending}
          className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-accent disabled:opacity-50"
        >
          {ending ? "Saving..." : "End & share wisdom"}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.blocked
                    ? "max-w-[80%] rounded-2xl rounded-bl-md border border-destructive/40 bg-destructive/10 px-5 py-3 text-destructive shadow-sm"
                    : m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-5 py-3 text-primary-foreground shadow-sm"
                      : "max-w-[80%] rounded-2xl rounded-bl-md bg-card px-5 py-3 text-card-foreground shadow-sm"
                }
              >
                {m.blocked && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80">
                    Message blocked
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-card px-5 py-3 text-muted-foreground shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-border bg-card/60 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-2xl">
          {isBlocked && (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              Chatting is paused for {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}. Let's pick this up again in a moment.
            </p>
          )}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isBlocked
                  ? "Chatting is paused for a few minutes..."
                  : "Write in English, Urdu, or Roman Urdu..."
              }
              className="flex-1 rounded-full border border-input bg-background px-5 py-3 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              disabled={loading || isBlocked}
            />
            <button
              type="submit"
              disabled={loading || isBlocked || !input.trim()}
              className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
