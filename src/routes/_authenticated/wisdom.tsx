import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";

type Wisdom = {
  id: string;
  created_at: string;
  text: string;
  language: string;
};

const wisdomQuery = queryOptions({
  queryKey: ["wisdom"],
  queryFn: async (): Promise<Wisdom[]> => {
    const { data, error } = await supabase
      .from("wisdom_entries")
      .select("id, created_at, text, language")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/_authenticated/wisdom")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Wisdom Wall — Qissa" },
      { name: "description", content: "Anonymous pieces of wisdom shared by elders around the world, in English and Urdu." },
      { property: "og:title", content: "Wisdom Wall — Qissa" },
      { property: "og:description", content: "Anonymous wisdom shared by elders — lessons, stories, and gentle advice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WisdomPage,
});

function WisdomPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-serif text-2xl">Qissa</Link>
        <Link
          to="/chat"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Start Talking
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl">The Wisdom Wall</h1>
        <p className="mt-4 text-muted-foreground">
          Anonymous lessons, memories, and gentle advice shared by our elders.
        </p>
      </div>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <Suspense fallback={<p className="py-16 text-center text-muted-foreground">Loading wisdom...</p>}>
          <WisdomList />
        </Suspense>
      </main>
    </div>
  );
}

function WisdomList() {
  const { data } = useSuspenseQuery(wisdomQuery);

  if (data.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-muted-foreground">
          No wisdom shared yet.
        </p>
        <Link
          to="/chat"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Be the first
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((w) => (
        <article
          key={w.id}
          className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60 transition hover:shadow-md"
        >
          <p
            className="whitespace-pre-wrap text-card-foreground"
            dir={w.language === "ur" ? "rtl" : "ltr"}
            style={w.language === "ur" ? { fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2 } : undefined}
          >
            “{w.text}”
          </p>
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
            {labelFor(w.language)} · {new Date(w.created_at).toLocaleDateString()}
          </p>
        </article>
      ))}
    </div>
  );
}

function labelFor(lang: string) {
  switch (lang) {
    case "ur": return "Urdu";
    case "roman-ur": return "Roman Urdu";
    case "en": return "English";
    default: return lang;
  }
}
