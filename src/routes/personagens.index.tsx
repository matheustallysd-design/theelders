import { createFileRoute } from "@tanstack/react-router";
import { characters } from "@/content/characters";
import { EntryCard } from "@/components/Entries";
import { media } from "@/content/media";

export const Route = createFileRoute("/personagens/")({
  head: () => ({
    meta: [
      { title: "Personagens — THE ELDER" },
      { name: "description", content: "Conheça Suzune Suzue e o Mago Selado, os rostos da história de THE ELDER." },
      { property: "og:title", content: "Personagens — THE ELDER" },
      { property: "og:description", content: "Rostos da história." },
    ],
  }),
  component: Characters,
});

function Characters() {
  return (
    <main className="content-page mg-page" style={{ ["--page-art" as string]: `url(${media.duo})` }}>
      <div className="section-kicker">ARQUIVO DO MUNDO / 02</div>
      <h1>Rostos da<br /><em>história.</em></h1>
      <p className="page-lead">Personagens conhecidos até o momento. Novos registros serão adicionados conforme a narrativa avançar.</p>
      <div className="mg-grid">{characters.map((c) => <EntryCard key={c.slug} e={c} kind="personagens" />)}</div>
    </main>
  );
}
