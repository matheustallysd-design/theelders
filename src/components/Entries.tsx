import { Link } from "@tanstack/react-router";
import type { Entry } from "@/content/characters";
import { BlockPage } from "./BlockPage";
import { entryDefaults } from "@/lib/blocks";
import { EText, useEImg } from "@/components/Editable";

export function EntryCard({ e, kind }: { e: Entry; kind: "personagens" | "bestiario" }) {
  const cardImg = useEImg(`card-${e.slug}`, e.portrait, e.pos);

  const inner = (
    <>
      <div
        className="mg-card-art"
        style={{
          backgroundImage: `url(${cardImg.src})`,
          backgroundPosition: cardImg.pos,
          ...(e.zoom ? { backgroundSize: e.zoom } : {}),
        }}
      />
      <div className="mg-card-body">
        <span className="mg-tag">
          <EText id={`card-${e.slug}-tag`} text={e.tag} />
        </span>
        <h2>
          <EText id={`card-${e.slug}-name`} text={e.name} />
        </h2>
        <p>
          <EText id={`card-${e.slug}-summary`} text={e.summary} />
        </p>
        <small>
          <EText id={`card-${e.slug}-status`} text={e.status} />
        </small>
      </div>
    </>
  );

  return kind === "personagens" ? (
    <Link to="/personagens/$slug" params={{ slug: e.slug }} className="mg-card">
      {inner}
    </Link>
  ) : (
    <Link to="/bestiario/$slug" params={{ slug: e.slug }} className="mg-card">
      {inner}
    </Link>
  );
}

export function EntryDetail({ e, back, extraText }: { e: Entry; back: React.ReactNode; extraText?: string }) {
  const heroImg = useEImg(`entry-hero-${e.slug}`, e.portrait, e.pos);

  return (
    <main className="mg-detail">
      <section
        className="mg-detail-hero"
        style={{
          backgroundImage: `url(${heroImg.src})`,
          backgroundPosition: heroImg.pos,
          backgroundSize: e.zoom ?? "220%",
        }}
      >
        <div className="mg-detail-shade" />
        <div className="mg-detail-text">
          {back}
          <span className="mg-tag">
            <EText id={`entry-${e.slug}-tag`} text={e.tag} />
          </span>
          <h1>
            <EText id={`entry-${e.slug}-name`} text={e.name} />
          </h1>
          <blockquote className="mg-bubble">
            “<EText id={`entry-${e.slug}-quote`} text={e.quote} />”
          </blockquote>
        </div>
      </section>
      <section className="mg-detail-body">
        <BlockPage page={`entry-${e.slug}`} defaults={() => entryDefaults(e, extraText)} />
      </section>
    </main>
  );
}
