import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { media } from "@/content/media";
import { ScrollText, Compass, Sparkles, Users } from "lucide-react";

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

function ArchiveCard({ icon, title, desc, tag, art }: { icon: ReactNode; title: string; desc: string; tag: string; art: string }) {
  return <div className="archive-card mg-archive" style={{ backgroundImage: `url(${art})` }}><div className="archive-icon">{icon}</div><span className="gold-label">{tag}</span><h2>{title}</h2><p>{desc}</p></div>;
}

function World() {
  return (
    <main className="content-page mg-page" style={{ ["--page-art" as string]: `url(${media.capa})` }}><div className="section-kicker">ARQUIVO DO MUNDO / 01</div><h1>O que resta<br /><em>da Era Perdida?</em></h1><p className="page-lead">Registros, lendas e fragmentos de um mundo que mudou depois da Guerra Divina.</p>
      <div className="archive-grid">
        <ArchiveCard icon={<ScrollText />} art={media.capa} title="Eras & História" desc="A Guerra Divina, a Era Perdida e os acontecimentos que moldaram o presente." tag="EM CONSTRUÇÃO" />
        <ArchiveCard icon={<Compass />} art={media.reptil} title="Regiões & Masmorras" desc="Territórios conhecidos, labirintos recém-descobertos e lugares que não constam nos mapas." tag="EM CONSTRUÇÃO" />
        <ArchiveCard icon={<Sparkles />} art={media.mago} title="Magia & Sistemas" desc="O desenvolvimento da magia, afinidades elementais e conhecimentos antigos." tag="EM CONSTRUÇÃO" />
        <ArchiveCard icon={<Users />} art={media.duo} title="Raças & Povos" desc="Humanos, Elfos, Meio-humanos e outras raças que habitam este mundo." tag="EM CONSTRUÇÃO" />
      </div>
    </main>
  );
}
