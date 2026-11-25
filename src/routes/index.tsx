import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE ELDER — Chronicles of the Lost Age" },
      { name: "description", content: "Nem toda lenda conta a verdade. Leia THE ELDER, uma fantasia sombria sobre a Era Perdida." },
      { property: "og:title", content: "THE ELDER — Chronicles of the Lost Age" },
      { property: "og:description", content: "Nem toda lenda conta a verdade. Nem toda queda representa o fim." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="eyebrow"><span /> UMA HISTÓRIA ALÉM DAS LENDAS</div>
          <h1>THE<br /><em>ELDER</em></h1>
          <p className="hero-sub">Nem toda lenda conta a verdade.<br />Nem toda queda representa o fim.</p>
          <p className="hero-copy">Em um mundo erguido sobre os vestígios de uma guerra esquecida, uma jovem aventureira encontrará nas profundezas respostas que ninguém deveria conhecer.</p>
          <div className="hero-actions">
            <Link to="/capitulos" className="primary-btn"><BookOpen size={17} /> COMEÇAR A LER</Link>
            <Link to="/mundo" className="text-btn">EXPLORAR O UNIVERSO <ArrowDown size={15} /></Link>
          </div>
          <div className="hero-meta"><span>FANTASIA SOMBRIA</span><i /> <span>MISTÉRIO</span><i /> <span>AVENTURA</span></div>
        </div>
        <div className="hero-side-note">VOL. I <span>—</span> O ABISMO</div>
        <div className="hero-bottom"><span>ROLE PARA DESCOBRIR</span><div /></div>
      </section>
      <section className="intro-section">
        <div className="section-kicker">01 / A JORNADA COMEÇA</div>
        <div className="intro-grid"><div><h2>O mundo esqueceu.<br /><em>As profundezas, não.</em></h2></div><div className="intro-text"><p>Há mais de dois mil anos, Deuses e Demônios disputavam o domínio do mundo. Os humanos, frágeis diante de tamanho poder, encontraram uma maneira de mudar o destino de todos.</p><p>A guerra terminou. Uma nova era nasceu. E a verdade foi enterrada sob o nome de <strong>Era Perdida</strong>.</p></div></div>
      </section>
      <section className="feature-section">
        <div className="section-kicker">02 / ENTRE NA HISTÓRIA</div>
        <div className="feature-card"><div className="feature-art"><span className="art-caption">THE ELDER / CHAPTER 01</span></div><div className="feature-info"><span className="gold-label">CAPÍTULO DISPONÍVEL</span><h2>O Abismo</h2><p>Suzue entra em uma nova masmorra em busca de seu sonho. Mas uma traição a lançará em um lugar que nenhum aventureiro conhece.</p><div className="feature-details"><span>01 CAPÍTULO</span><span>LEITURA NARRATIVA</span></div><Link to="/capitulos" className="primary-btn">ABRIR CAPÍTULO <ChevronRight size={16} /></Link></div></div>
      </section>
      <section className="quote-band"><span>“</span><p>Já que não consigo subir...<br /><em>Irei descer.</em></p><small>— SUZUE</small></section>
    </main>
  );
}
