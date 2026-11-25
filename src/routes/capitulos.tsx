import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { chapter } from "@/content/story";

export const Route = createFileRoute("/capitulos")({
  head: () => ({
    meta: [
      { title: "Capítulo 01: O Abismo — THE ELDER" },
      { name: "description", content: "Leia o Capítulo 01 de THE ELDER: O Abismo. Toda lenda esconde uma verdade esquecida." },
      { property: "og:title", content: "Capítulo 01: O Abismo — THE ELDER" },
      { property: "og:description", content: "Toda lenda esconde uma verdade esquecida." },
    ],
  }),
  component: Reader,
});

const KEY = "the-elder:cap01";

function Reader() {
  const navigate = useNavigate();
  const [section, setSection] = useState(0);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const total = chapter.sections.length;

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (typeof d.section === "number" && d.section < total) setSection(d.section);
      if (d.saved) setSaved(true);
    } catch { /* ignore */ }
    setReady(true);
  }, [total]);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify({ section, saved }));
  }, [section, saved, ready]);

  const go = (n: number) => { setSection(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const current = chapter.sections[section] ?? chapter.sections[0]!;
  const progress = Math.round(((section + 1) / total) * 100);
  const last = section === total - 1;

  return (
    <main className="reader-page">
      <div className="reader-top">
        <Link to="/" className="back-link"><ChevronLeft size={16} /> VOLTAR AO INÍCIO</Link>
        <span>THE ELDER <i>/</i> CAPÍTULO 01</span>
        <button className={saved ? "save-btn saved" : "save-btn"} onClick={() => setSaved(!saved)}><Bookmark size={15} fill={saved ? "currentColor" : "none"} />{saved ? "SALVO" : "SALVAR"}</button>
      </div>
      <div className="reader-heading"><div className="section-kicker">{chapter.number}</div><h1>{chapter.title}</h1><p>{chapter.subtitle}</p></div>
      <div className="progress-wrap"><div className="progress-label"><span>PROGRESSO DO CAPÍTULO</span><span>{progress}%</span></div><div className="progress-track"><div style={{ width: `${progress}%` }} /></div></div>
      <article className="story-panel">
        <div className="story-section-label"><span>✦</span> {current.heading.toUpperCase()}</div>
        {current.text.split("\n\n").map((p, i) => {
          const lines = p.split("\n");
          return <p key={i}>{lines.map((l, j) => <span key={j}>{l}{j < lines.length - 1 && <br />}</span>)}</p>;
        })}
      </article>
      <div className="reader-controls">
        <button className="secondary-btn" disabled={section === 0} onClick={() => go(Math.max(0, section - 1))}><ChevronLeft size={16} /> ANTERIOR</button>
        <span>{String(section + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <button className="primary-btn" onClick={() => (last ? navigate({ to: "/" }) : go(section + 1))}>{last ? "FINALIZAR" : "PRÓXIMA CENA"} <ChevronRight size={16} /></button>
      </div>
    </main>
  );
}
