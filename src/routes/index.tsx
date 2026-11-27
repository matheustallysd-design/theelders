import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { media } from "@/content/media";
import { EText, useEImg } from "@/components/Editable";
import { BlockPage } from "@/components/BlockPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE ELDER — Chronicles of the Lost Age" },
      { name: "description", content: "Nem toda lenda conta a verdade. Leia THE ELDER, uma fantasia sombria em estilo mangá sobre a Era Perdida." },
      { property: "og:title", content: "THE ELDER — Chronicles of the Lost Age" },
      { property: "og:description", content: "Algumas lendas não devem ser esquecidas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const panels = [
  { id: "queda", img: media.besta, pos: "75% 95%", sfx: "GRRRAAH!", title: "A Queda", text: "Com um golpe da cauda, Suzue é lançada no abismo.", slug: "besta-do-abismo" },
  { id: "toca", img: media.reptil, pos: "60% 72%", sfx: "SLASH!", title: "A Toca", text: "Ela não teve escolha. Teve que lutar.", slug: "criatura-da-toca" },
  { id: "sombra", img: media.pantera, pos: "85% 75%", sfx: "...", title: "A Sombra", text: "Nas profundezas... ela ainda observa.", slug: "pantera-negra" },
];

function Panel({ p }: { p: (typeof panels)[number] }) {
  const m = useEImg(`home-panel-${p.id}`, p.img, p.pos);
  return (
    <Link to="/bestiario/$slug" params={{ slug: p.slug }} className="mg-panel mg-strip-panel ed-host" style={{ backgroundImage: `url(${m.src})`, backgroundPosition: m.pos, ...(m.zoom ? { backgroundSize: m.zoom } : {}), ...m.fx }}>
      {m.editor}
      <span className="mg-sfx"><EText id={`home-panel-${p.id}-sfx`} text={p.sfx} /></span>
      <div className="mg-caption"><b><EText id={`home-panel-${p.id}-title`} text={p.title} /></b><EText id={`home-panel-${p.id}-text`} text={p.text} /></div>
    </Link>
  );
}

function Home() {
  const vid = useEImg("home-hero-video", media.videoAvancando);
  const cover = useEImg("home-cover", media.capa);
  const elder = useEImg("home-elder", media.elderPreso);
  return (
    <main>
      <section className="mg-hero">
        {vid.video ? <video className="mg-hero-video" src={vid.src} autoPlay muted loop playsInline style={{ objectPosition: vid.pos, ...vid.fx }} />
          : <img className="mg-hero-video" src={vid.src} alt="" style={{ objectPosition: vid.pos, ...vid.fx }} />}
        <div className="mg-hero-shade" />
        {vid.editor && <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>{vid.editor}</div>}
        <div className="mg-hero-content">
          <div className="eyebrow"><span /> <EText id="home-eyebrow" text="UMA HISTÓRIA ALÉM DAS LENDAS" /></div>
          <h1><EText id="home-title-the" text="THE" /><br /><em><EText id="home-title-elder" text="ELDER" /></em></h1>
          <p className="hero-sub"><EText id="home-sub" text={"Nem toda lenda conta a verdade.\nNem toda queda representa o fim."} /></p>
          <div className="hero-actions">
            <Link to="/capitulos" className="primary-btn"><BookOpen size={17} /> <EText id="home-btn-ler" text="COMEÇAR A LER" /></Link>
            <Link to="/personagens" className="mg-ghost-btn"><EText id="home-btn-pers" text="PERSONAGENS" /> <ChevronRight size={15} /></Link>
          </div>
        </div>
        <div className="mg-hero-cover ed-host" style={{ padding: 0 }}>
          {cover.video ? <video src={cover.src} autoPlay muted loop playsInline style={{ width: "100%", display: "block", ...cover.fx }} />
            : <img src={cover.src} alt="Capa de THE ELDER — Capítulo 1, O Abismo" style={{ width: "100%", display: "block", objectPosition: cover.pos, ...cover.fx }} />}
          {cover.editor}
        </div>
        <span className="mg-sfx mg-sfx-hero"><EText id="home-sfx-hero" text="ZAN!" /></span>
      </section>

      <section className="bk-home"><BlockPage page="home-a" defaults={() => []} className="bk-quiet" /></section>

      <section className="mg-strip">
        <div className="section-kicker"><EText id="home-kicker-1" text="01 / CENAS DO CAPÍTULO" /></div>
        <div className="mg-strip-grid">{panels.map((p) => <Panel key={p.id} p={p} />)}</div>
      </section>

      <section className="bk-home"><BlockPage page="home-b" defaults={() => []} className="bk-quiet" /></section>

      <section className="mg-split">
        <div className="mg-panel mg-split-art ed-host">
          {elder.video ? <video src={elder.src} autoPlay muted loop playsInline style={{ width: "100%", display: "block", ...elder.fx }} />
            : <img src={elder.src} alt="O Elder aprisionado sob a luz da lua" style={{ objectPosition: elder.pos, ...elder.fx }} />}
          {elder.editor}
        </div>
        <div className="mg-split-text">
          <div className="section-kicker"><EText id="home-kicker-2" text="02 / O ANCIÃO" /></div>
          <h2><EText id="home-ancao-title" text={"Ele não é apenas um mago.\nÉ uma prisão vestida de homem."} /></h2>
          <p><EText id="home-ancao-desc" text="Há mais de dois mil anos, Deuses e Demônios disputavam o domínio do mundo. A guerra terminou, e a verdade foi enterrada sob o nome de Era Perdida." /></p>
          <Link to="/personagens/$slug" params={{ slug: "o-mago-selado" }} className="primary-btn"><EText id="home-btn-mago" text="CONHECER O MAGO SELADO" /> <ChevronRight size={16} /></Link>
        </div>
      </section>

      <section className="bk-home"><BlockPage page="home-c" defaults={() => []} className="bk-quiet" /></section>
    </main>
  );
}
