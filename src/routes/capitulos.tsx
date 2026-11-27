import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Bookmark, BookOpen, ScrollText } from "lucide-react";
import { Pager } from "@/components/Pager";
import { Reactions } from "@/components/Reactions";
import { chapter } from "@/content/story";
import { BlockPage } from "@/components/BlockPage";
import { sceneDefaults } from "@/lib/blocks";
import { EText } from "@/components/Editable";

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
        <button className={saved ? "save-btn saved" : "save-btn"} onClick={() => setSaved(!saved)}>
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />{saved ? "SALVO" : "SALVAR"}
        </button>
      </div>

      <div className="reader-heading">
        <div className="section-kicker"><EText id="cap-heading-number" text={chapter.number} /></div>
        <h1><EText id="cap-heading-title" text={chapter.title} /></h1>
        <p><EText id="cap-heading-subtitle" text={chapter.subtitle} /></p>
      </div>

      <div className="mode-switch">
        <span>Modo de leitura:</span>
        <button type="button" className={mode === "cena" ? "active" : ""} onClick={() => setMode("cena")}>
          <BookOpen size={14} /> Cena a cena
        </button>
        <button type="button" className={mode === "rolo" ? "active" : ""} onClick={() => setMode("rolo")}>
          <ScrollText size={14} /> Rolo contínuo
        </button>
      </div>

      {mode === "cena" ? (
        <article className="reader-card">
          <div className="reader-card-header">
            <span className="scene-indicator">Cena {String(section + 1).padStart(2, "0")} de {String(total).padStart(2, "0")}</span>
            <span className="progress-pct">{progress}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <h2>{current.heading}</h2>

          <BlockPage page={`cap01-s${section}`} defaults={() => sceneDefaults(section)} />

          <Pager current={section} total={total} onGo={go} label="Cena" />

          <div className="reader-nav">
            <button className="nav-btn" disabled={section === 0} onClick={() => go(section - 1)}>
              <ChevronLeft size={18} /> Anterior
            </button>
            {last ? (
              <button className="nav-btn finish" onClick={() => navigate({ to: "/mundo" })}>
                Concluir leitura <ChevronRight size={18} />
              </button>
            ) : (
              <button className="nav-btn primary" onClick={() => go(section + 1)}>
                Próxima cena <ChevronRight size={18} />
              </button>
            )}
          </div>
        </article>
      ) : (
        <div className="reader-continuous">
          {chapter.sections.map((s, i) => (
            <article key={i} className="reader-card continuous-scene" id={`cena-${i + 1}`}>
              <div className="reader-card-header">
                <span className="scene-indicator">Cena {String(i + 1).padStart(2, "0")} — {s.heading}</span>
                <span className="progress-pct">{Math.round(((i + 1) / total) * 100)}%</span>
              </div>
              <h2>{s.heading}</h2>
              <BlockPage page={`cap01-s${i}`} defaults={() => sceneDefaults(i)} />
            </article>
          ))}
        </div>
      )}

      <Reactions chapter="cap01" />
    </main>
  );
}
