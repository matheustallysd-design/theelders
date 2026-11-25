import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { media } from "@/content/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE ELDER — Chronicles of the Lost Age" },
      { name: "description", content: "Nem toda lenda conta a verdade. Leia THE ELDER, uma fantasia sombria em estilo mangá sobre a Era Perdida." },
      { property: "og:title", content: "THE ELDER — Chronicles of the Lost Age" },
      { property: "og:description", content: "Algumas lendas não devem ser esquecidas." },
    ],
  }),
  component: Home,
});

const panels = [
  { img: media.besta, pos: "75% 95%", sfx: "GRRRAAH!", title: "A Queda", text: "Com um golpe da cauda, Suzue é lançada no abismo.", slug: "besta-do-abismo" },
  { img: media.reptil, pos: "60% 72%", sfx: "SLASH!", title: "A Toca", text: "Ela não teve escolha. Teve que lutar.", slug: "criatura-da-toca" },
  { img: media.pantera, pos: "85% 75%", sfx: "...", title: "A Sombra", text: "Nas profundezas... ela ainda observa.", slug: "pantera-negra" },
];

function Home() {
  return (
    <main>
      <section className="mg-hero">
        <video className="mg-hero-video" src={media.videoAvancando} autoPlay muted loop playsInline />
        <div className="mg-hero-shade" />
        <div className="mg-hero-content">
          <div className="eyebrow"><span /> UMA HISTÓRIA ALÉM DAS LENDAS</div>
          <h1>THE<br /><em>ELDER</em></h1>
          <p className="hero-sub">Nem toda lenda conta a verdade.<br />Nem toda queda representa o fim.</p>
          <div className="hero-actions">
            <Link to="/capitulos" className="primary-btn"><BookOpen size={17} /> COMEÇAR A LER</Link>
            <Link to="/personagens" className="mg-ghost-btn">PERSONAGENS <ChevronRight size={15} /></Link>
          </div>
        </div>
        <img className="mg-hero-cover" src={media.capa} alt="Capa de THE ELDER — Capítulo 1, O Abismo" />
        <span className="mg-sfx mg-sfx-hero">ZAN!</span>
      </section>

      <section className="mg-strip">
        <div className="section-kicker">01 / CENAS DO CAPÍTULO</div>
        <div className="mg-strip-grid">
          {panels.map((p) => (
            <Link key={p.title} to="/bestiario/$slug" params={{ slug: p.slug }} className="mg-panel mg-strip-panel" style={{ backgroundImage: `url(${p.img})`, backgroundPosition: p.pos }}>
              <span className="mg-sfx">{p.sfx}</span>
              <div className="mg-caption"><b>{p.title}</b>{p.text}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mg-split">
        <div className="mg-panel mg-split-art"><img src={media.elderPreso} alt="O Elder aprisionado sob a luz da lua" /></div>
        <div className="mg-split-text">
          <div className="section-kicker">02 / O ANCIÃO</div>
          <h2>Ele não é apenas um mago.<br /><em>É uma prisão vestida de homem.</em></h2>
          <p>Há mais de dois mil anos, Deuses e Demônios disputavam o domínio do mundo. A guerra terminou, e a verdade foi enterrada sob o nome de <strong>Era Perdida</strong>.</p>
          <Link to="/personagens/$slug" params={{ slug: "o-mago-selado" }} className="primary-btn">CONHECER O MAGO SELADO <ChevronRight size={16} /></Link>
        </div>
      </section>

      <section className="mg-quote">
        <video src={media.videoLevantando} autoPlay muted loop playsInline />
        <div className="mg-quote-shade" />
        <p className="mg-bubble">Já que não consigo subir...<br /><em>Irei descer.</em></p>
        <small>— SUZUE</small>
      </section>
    </main>
  );
}
