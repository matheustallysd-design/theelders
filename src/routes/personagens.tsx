import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/personagens")({
  head: () => ({
    meta: [
      { title: "Personagens — THE ELDER" },
      { name: "description", content: "Conheça os rostos da história de THE ELDER, como Suzue e o Mago Selado." },
      { property: "og:title", content: "Personagens — THE ELDER" },
      { property: "og:description", content: "Rostos da história." },
    ],
  }),
  component: Characters,
});

function Characters() {
  return (
    <main className="content-page"><div className="section-kicker">ARQUIVO DO MUNDO / 02</div><h1>Rostos da<br /><em>história.</em></h1><p className="page-lead">Personagens conhecidos até o momento. Novos registros serão adicionados conforme a narrativa avançar.</p>
      <div className="character-grid">
        <div className="character-card"><div className="character-placeholder">S</div><div><span className="gold-label">AVENTUREIRA</span><h2>Suzue</h2><p>Uma jovem determinada a alcançar o Rank S. Após ser traída por seu grupo, precisa sobreviver nas profundezas de uma masmorra desconhecida.</p><small>STATUS: VIVA — LOCALIZAÇÃO DESCONHECIDA</small></div></div>
        <div className="character-card locked"><div className="character-placeholder">?</div><div><span className="gold-label">REGISTRO INCOMPLETO</span><h2>O Mago Selado</h2><p>Uma figura envolta em mistério, ligada às lendas sobre as profundezas e ao passado do mundo.</p><small>STATUS: INFORMAÇÕES INSUFICIENTES</small></div></div>
      </div>
    </main>
  );
}
