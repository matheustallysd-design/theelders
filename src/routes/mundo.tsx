import { createFileRoute } from "@tanstack/react-router";
import { media } from "@/content/media";
import { BlockPage } from "@/components/BlockPage";
import { worldDefaults } from "@/lib/blocks";

export const Route = createFileRoute("/mundo")({
  head: () => ({
    meta: [
      { title: "Arquivo do Mundo — THE ELDER" },
      { name: "description", content: "Registros, lendas e fragmentos da Era Perdida: eras, regiões, magia e raças de THE ELDER." },
      { property: "og:title", content: "Arquivo do Mundo — THE ELDER" },
      { property: "og:description", content: "O que resta da Era Perdida?" },
    ],
  }),
  component: World,
});

function World() {
  return (
    <main className="content-page mg-page" style={{ ["--page-art" as string]: `url(${media.capa})` }}><div className="section-kicker">ARQUIVO DO MUNDO / 01</div><h1>O que resta<br /><em>da Era Perdida?</em></h1><p className="page-lead">Registros, lendas e fragmentos de um mundo que mudou depois da Guerra Divina.</p>
      <BlockPage page="mundo" defaults={worldDefaults} className="bk-world" />
    </main>
  );
}
