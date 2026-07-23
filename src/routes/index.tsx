import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Qissa — A warm companion who listens" },
      { name: "description", content: "Qissa is a gentle chat companion for elders. Share your stories and wisdom in English or Urdu — anonymized reflections join the public Wisdom Wall." },
      { property: "og:title", content: "Qissa — A warm companion who listens" },
      { property: "og:description", content: "Qissa is a gentle chat companion for elders. Share your stories and wisdom in English or Urdu — anonymized reflections join the public Wisdom Wall." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <div className="font-serif text-2xl">Qissa</div>
        <Link
          to="/wisdom"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Wisdom Wall →
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
          قصّہ · A companion who listens
        </p>
        <h1 className="text-5xl leading-tight text-foreground sm:text-6xl">
          Every life holds a story worth remembering.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          Qissa is a warm, patient companion. Chat in English or Urdu — Roman or
          script — about anything on your mind. The wisdom you share, anonymized,
          becomes a gift on our public Wisdom Wall.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/chat"
            className="rounded-full bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Start Talking
          </Link>
          <Link
            to="/wisdom"
            className="rounded-full border border-border px-8 py-4 text-lg font-medium text-foreground transition hover:bg-accent"
          >
            Read the Wisdom Wall
          </Link>
        </div>

        <div className="mt-24 grid gap-8 text-left sm:grid-cols-3">
          {[
            { t: "Speak your language", d: "English, Urdu, or Roman Urdu — Qissa follows your lead." },
            { t: "Be truly heard", d: "A gentle listener, always patient, never rushed." },
            { t: "Leave something behind", d: "Your lessons live on, anonymized, for others to find." },
          ].map((f) => (
            <div key={f.t}>
              <h3 className="text-xl">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        No sign-up. No tracking. Just conversation.
      </footer>
    </div>
  );
}
