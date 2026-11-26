import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageNumbers } from "@/lib/pagination";

export function Pager({ current, total, onGo, label = "Página" }: { current: number; total: number; onGo: (n: number) => void; label?: string }) {
  if (total <= 1) return null;
  return (
    <nav className="pager" aria-label={label}>
      <button disabled={current === 0} onClick={() => onGo(current - 1)} aria-label="Anterior"><ChevronLeft size={16} /></button>
      {pageNumbers(current, total, 2).map((n, i) => n === "…" ? <span key={`e${i}`}>…</span>
        : <button key={n} className={n === current ? "on" : ""} aria-current={n === current ? "page" : undefined} onClick={() => onGo(n)}>{String(n + 1).padStart(2, "0")}</button>)}
      <button disabled={current === total - 1} onClick={() => onGo(current + 1)} aria-label="Próxima"><ChevronRight size={16} /></button>
    </nav>
  );
}
