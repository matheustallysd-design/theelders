import { Link } from "@tanstack/react-router";
import type { Entry } from "@/content/characters";
import { BlockPage } from "./BlockPage";
import { entryDefaults } from "@/lib/blocks";

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

export function EntryDetail({ e, back, extraText }: { e: Entry; back: React.ReactNode; extraText?: string }) {
  return (
    <main className="mg-detail">
      <section className="mg-detail-hero" style={{ backgroundImage: `url(${e.portrait})`, backgroundPosition: e.pos, backgroundSize: e.zoom ?? "220%" }}>
        <div className="mg-detail-shade" />
        <div className="mg-detail-text">
          {back}
          <span className="mg-tag">{e.tag}</span>
          <h1>{e.name}</h1>
          <blockquote className="mg-bubble">“{e.quote}”</blockquote>
        </div>
      </section>
      <section className="mg-detail-body">
        <BlockPage page={`entry-${e.slug}`} defaults={() => entryDefaults(e, extraText)} />
      </section>
    </main>
  );
}
