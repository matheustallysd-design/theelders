import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { characters } from "@/content/characters";
import { EntryDetail } from "@/components/Entries";

export const Route = createFileRoute("/personagens/$slug")({
  loader: ({ params }) => {
    const e = characters.find((c) => c.slug === params.slug);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — THE ELDER` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.name} — THE ELDER` },
          { property: "og:description", content: loaderData.quote },
        ]
      : [{ title: "Personagem — THE ELDER" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <EntryDetail e={Route.useLoaderData()} back={<Link to="/personagens" className="back-link"><ChevronLeft size={16} /> PERSONAGENS</Link>} />,
});
