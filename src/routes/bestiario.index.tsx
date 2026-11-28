import { EText } from "@/components/Editable";
import { createFileRoute } from "@tanstack/react-router";
import { beasts } from "@/content/bestiary";
import { EntryCard } from "@/components/Entries";
import { media } from "@/content/media";

export const Route = createFileRoute("/bestiario/")({
  head: () => ({
    meta: [
      { title: "Bestiário — THE ELDER" },
      { name: "description", content: "As criaturas das profundezas do labirinto: Besta do Abismo, Pantera Negra e a Criatura da Toca." },
      { property: "og:title", content: "Bestiário — THE ELDER" },
      { property: "og:description", content: "O que vive nas profundezas do labirinto." },
    ],
  }),
  component: Bestiary,
});

function Bestiary() {
  return (
    <main className="content-page mg-page" style={{ ["--page-art" as string]: `url(${media.besta})` }}>
      <div className="section-kicker"><EText id="best-kicker" text="ARQUIVO DO MUNDO / 03" /></div>
      <h1><EText id="best-t1" text="O que vive" /><br /><em><EText id="best-t2" text="nas profundezas." /></em></h1>
      <p className="page-lead"><EText id="best-lead" text="Registros das criaturas encontradas por Suzue no labirinto." /></p>
      <div className="mg-grid">{beasts.map((b) => <EntryCard key={b.slug} e={b} kind="bestiario" />)}</div>
    </main>
  );
}
