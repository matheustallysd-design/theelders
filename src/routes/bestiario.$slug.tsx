import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { beasts } from "@/content/bestiary";
import { EntryDetail } from "@/components/Entries";

export const Route = createFileRoute("/bestiario/$slug")({
  loader: ({ params }) => {
    const e = beasts.find((b) => b.slug === params.slug);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Bestiário THE ELDER` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.name} — THE ELDER` },
          { property: "og:description", content: loaderData.quote },
        ]
      : [{ title: "Criatura — THE ELDER" }, { name: "robots", content: "noindex" }],
  }),
  component: BeastPage,
});

function BeastPage() {
  const e = Route.useLoaderData();
  return <EntryDetail e={e} back={<Link to="/bestiario" className="back-link"><ChevronLeft size={16} /> BESTIÁRIO</Link>} extraText={`Tamanho: ${e.size}`} />;
}
