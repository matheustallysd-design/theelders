import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Bookmark, BookOpen, ScrollText } from "lucide-react";
import { Pager } from "@/components/Pager";
import { Reactions } from "@/components/Reactions";
import { chapter } from "@/content/story";
import { BlockPage } from "@/components/BlockPage";
import { sceneDefaults } from "@/lib/blocks";

export const Route = createFileRoute("/capitulos")({
  head: () => ({
    meta: [
      { title: "Capítulo 01: O Abismo — THE ELDER" },
      { name: "description", content: "Leia o Capítulo 01 de THE ELDER: O Abismo. Toda lenda esconde uma verdade esquecida." },
      { property: "og:title", content: "Capítulo 01: O Abismo — THE ELDER" },
      { property: "og:description", content: "Toda lenda esconde uma verdade esquecida." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
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
  const [mode, setMode] = useState<"cena" | "rolo">("cena");
  const total = chapter.sections.length;

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (typeof d.section === "number" && d.section < total) setSection(d.section);
      if (d.saved) setSaved(true);
      if (d.mode === "rolo") setMode("rolo");
    } catch { /* ignore */ }
    setReady(true);
  }, [total]);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify({ section, saved, mode }));
  }, [section, saved, mode, ready]);

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
      <div className="mode-switch">
        <button className={mode === "cena" ? "on" : ""} onClick={() => setMode("cena")}><BookOpen size={14} /> CENA A CENA</button>
        <button className={mode === "rolo" ? "on" : ""} onClick={() => setMode("rolo")}><ScrollText size={14} /> ROLO CONTÍNUO</button>
      </div>
      {mode === "cena" ? <>
        <Pager current={section} total={total} onGo={go} label="Cenas do capítulo" />
        <article className="story-panel bk-story">
          <div className="story-section-label"><span>✦</span> {current.heading.toUpperCase()}</div>
          <BlockPage page={`cap01-s${section}`} defaults={() => sceneDefaults(section)} />
        </article>
        <div className="reader-controls">
          <button className="secondary-btn" disabled={section === 0} onClick={() => go(Math.max(0, section - 1))}><ChevronLeft size={16} /> ANTERIOR</button>
          <span>{String(section + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <button className="primary-btn" onClick={() => (last ? navigate({ to: "/" }) : go(section + 1))}>{last ? "FINALIZAR" : "PRÓXIMA CENA"} <ChevronRight size={16} /></button>
        </div>
        <Pager current={section} total={total} onGo={go} label="Cenas do capítulo" />
      </> : chapter.sections.map((s, i) => (
        <article key={i} className="story-panel bk-story">
          <div className="story-section-label"><span>✦</span> {String(i + 1).padStart(2, "0")}. {s.heading.toUpperCase()}</div>
          <BlockPage page={`cap01-s${i}`} defaults={() => sceneDefaults(i)} />
        </article>
      ))}
      {(last || mode === "rolo") && <Reactions chapter="cap01" />}
    </main>
  );
}
