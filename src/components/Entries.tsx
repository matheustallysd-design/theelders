import { Link } from "@tanstack/react-router";
import type { Entry } from "@/content/characters";

export function EntryCard({ e, kind }: { e: Entry; kind: "personagens" | "bestiario" }) {
  const inner = (
    <>
      <div className="mg-card-art" style={{ backgroundImage: `url(${e.portrait})`, backgroundPosition: e.pos, ...(e.zoom ? { backgroundSize: e.zoom } : {}) }} />
      <div className="mg-card-body">
        <span className="mg-tag">{e.tag}</span>
        <h2>{e.name}</h2>
        <p>{e.summary}</p>
        <small>{e.status}</small>
      </div>
    </>
  );
  return kind === "personagens"
    ? <Link to="/personagens/$slug" params={{ slug: e.slug }} className="mg-card">{inner}</Link>
    : <Link to="/bestiario/$slug" params={{ slug: e.slug }} className="mg-card">{inner}</Link>;
}

export function EntryDetail({ e, back, extra }: { e: Entry; back: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <main className="mg-detail">
      <section className="mg-detail-hero" style={{ backgroundImage: `url(${e.portrait})`, backgroundPosition: e.pos }}>
        <div className="mg-detail-shade" />
        <div className="mg-detail-text">
          {back}
          <span className="mg-tag">{e.tag}</span>
          <h1>{e.name}</h1>
          <blockquote className="mg-bubble">“{e.quote}”</blockquote>
        </div>
      </section>
      <section className="mg-detail-info">
        <div><p className="mg-lead">{e.summary}</p><small className="mg-status">{e.status}</small>{extra}</div>
        <ul className="mg-facts">{e.facts.map((f) => <li key={f}>{f}</li>)}</ul>
      </section>
      <section className="mg-sheets">
        <div className="section-kicker">FICHAS / ARQUIVO</div>
        {e.sheets.map((s, i) => <a key={s + i} href={s} target="_blank" rel="noreferrer" className="mg-panel"><img src={s} alt={`Ficha de ${e.name}`} loading="lazy" /></a>)}
      </section>
    </main>
  );
}
