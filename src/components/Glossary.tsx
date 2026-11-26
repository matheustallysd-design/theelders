import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { characters, type Entry } from "@/content/characters";
import { beasts } from "@/content/bestiary";

type Term = { re: string; e: Entry; base: "/personagens/$slug" | "/bestiario/$slug" };
const terms: Term[] = [
  ...characters.map((e) => ({ e, base: "/personagens/$slug" as const })),
  ...beasts.map((e) => ({ e, base: "/bestiario/$slug" as const })),
].flatMap(({ e, base }) => {
  const names = [e.name, ...(e.slug === "suzune-suzue" ? ["Suzune", "Suzue"] : []), ...(e.slug === "o-mago-selado" ? ["Mago Selado", "Elder"] : [])];
  return names.map((re) => ({ re, e, base }));
}).sort((a, b) => b.re.length - a.re.length);
const pattern = new RegExp(`(${terms.map((t) => t.re.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");

/** Texto com termos do glossário clicáveis. O texto original não é alterado. */
export function Glossed({ text }: { text: string }) {
  const [open, setOpen] = useState<Term | null>(null);
  const parts: ReactNode[] = text.split(pattern).map((p, i) => {
    const t = terms.find((x) => x.re === p);
    return t ? <button key={i} className="gl-term" onClick={(e) => { e.stopPropagation(); setOpen(t); }}>{p}</button> : p;
  });
  return <>{parts}{open && (
    <span className="gl-pop" role="dialog" onClick={(e) => e.stopPropagation()}>
      <span className="gl-art" style={{ backgroundImage: `url(${open.e.portrait})`, backgroundPosition: open.e.pos }} />
      <span className="gl-body"><b>{open.e.name}</b><small>{open.e.tag}</small><span>{open.e.summary}</span>
        <Link to={open.base} params={{ slug: open.e.slug }}>Ver ficha completa →</Link></span>
      <button className="gl-x" aria-label="Fechar" onClick={() => setOpen(null)}><X size={16} /></button>
    </span>
  )}</>;
}
