import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — Qissa" },
      { name: "description", content: "Your Qissa dashboard — a warm space that's yours." },
      { property: "og:title", content: "Your Dashboard — Qissa" },
      { property: "og:description", content: "Your Qissa dashboard — a warm space that's yours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-2xl">Qissa</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/wisdom" className="text-muted-foreground hover:text-foreground">Wisdom Wall</Link>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-8 pb-24">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Your dashboard</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Welcome back{email ? `, ${email.split("@")[0]}` : ""}.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A quiet corner that's yours. Start a new conversation, or read what others have shared.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/chat"
            className="rounded-2xl bg-primary p-8 text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <h2 className="text-2xl">Start Talking</h2>
            <p className="mt-2 text-sm opacity-90">Open a warm conversation with Qissa.</p>
          </Link>
          <Link
            to="/wisdom"
            className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm transition hover:bg-accent"
          >
            <h2 className="text-2xl">The Wisdom Wall</h2>
            <p className="mt-2 text-sm text-muted-foreground">See what others have shared, anonymously.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
