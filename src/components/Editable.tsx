import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Replace, Bold, Italic, AlignLeft, AlignCenter, AlignRight, RotateCw, ZoomIn, ZoomOut, Sparkles, Square, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MediaPicker } from "./MediaPicker";
import { slotTextCss, slotImgCss, FILTERS, type SlotStyle } from "@/lib/slotStyle";

type Slot = { content: string; src: string | null; pos: string; kind: string; style: SlotStyle };

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const { data } = await supabase.from("content_blocks").select("page,content,src,pos,kind,style").like("page", "slot-%");
      const out: Record<string, Slot> = {};
      (data ?? []).forEach((r) => { out[r.page.slice(5)] = { content: r.content, src: r.src, pos: r.pos, kind: r.kind, style: (r.style ?? {}) as SlotStyle }; });
      return out;
    },
  });
}

function useSaveSlot() {
  const qc = useQueryClient();
  return async (id: string, slot: Slot) => {
    const page = `slot-${id}`;
    const del = await supabase.from("content_blocks").delete().eq("page", page);
    const ins = del.error ? del : await supabase.from("content_blocks").insert({ page, position: 0, kind: slot.kind, content: slot.content, src: slot.src, pos: slot.pos, style: slot.style as never });
    if (ins.error) { toast.error("Não foi possível salvar: " + ins.error.message); return; }
    await qc.invalidateQueries({ queryKey: ["slots"] });
    toast.success("Salvo para todos os leitores");
  };
}

const SIZES: SlotStyle["size"][] = ["sm", "md", "lg", "xl"];
const SIZE_L = { sm: "P", md: "M", lg: "G", xl: "GG" } as const;
const COLORS = ["", "#e0313f", "#3fd6e8", "#e8b84a", "#f4ecd8", "#9b6bff"];
const FONTS: [NonNullable<SlotStyle["font"]>, string][] = [["", "Padrão"], ["manga", "Mangá"], ["title", "Título"], ["body", "Texto"]];

/** Texto único editável (somente administradores no modo edição), com barra de estilo. */
export function EText({ id, text, className, style }: { id: string; text: string; className?: string; style?: CSSProperties }) {
  const { editMode } = useAuth();
  const { data } = useSlots();
  const save = useSaveSlot();
  const [open, setOpen] = useState(false);
  const cur = data?.[id];
  const value = cur?.content ?? text;
  const st = cur?.style ?? {};
  const css = { whiteSpace: "pre-line" as const, ...style, ...slotTextCss(st) };
  if (!editMode) return <span className={className} style={css}>{value}</span>;
  const setSt = (p: Partial<SlotStyle>) => save(id, { kind: "text", content: value, src: null, pos: "50% 50%", style: { ...st, ...p } });
  const keep = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
  return (
    <span className="ed-slot-wrap">
      <span className={`ed-slot ${className ?? ""}`} style={css} contentEditable suppressContentEditableWarning
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), (e.currentTarget as HTMLElement).blur())}
        onBlur={(e) => { setOpen(false); const v = e.currentTarget.innerText; if (v !== value) save(id, { kind: "text", content: v, src: null, pos: "50% 50%", style: st }); }}>
        {value}
      </span>
      {open && (
        <span className="ed-mini" onMouseDown={keep} onClick={(e) => e.stopPropagation()}>
          {SIZES.map((s) => <button key={s} className={st.size === s ? "on" : ""} onMouseDown={keep} onClick={() => setSt({ size: st.size === s ? undefined : s })}>{SIZE_L[s!]}</button>)}
          <i />
          <button className={st.bold ? "on" : ""} onClick={() => setSt({ bold: !st.bold })}><Bold size={13} /></button>
          <button className={st.italic ? "on" : ""} onClick={() => setSt({ italic: !st.italic })}><Italic size={13} /></button>
          <button className={st.glow ? "on" : ""} title="Brilho" onClick={() => setSt({ glow: !st.glow })}><Sparkles size={13} /></button>
          <i />
          <button onClick={() => setSt({ align: "left" })}><AlignLeft size={13} /></button>
          <button onClick={() => setSt({ align: "center" })}><AlignCenter size={13} /></button>
          <button onClick={() => setSt({ align: "right" })}><AlignRight size={13} /></button>
          <i />
          {COLORS.map((c) => <button key={c || "d"} className="ed-sw" title={c ? c : "Cor original"} style={{ background: c || "transparent" }} onClick={() => setSt({ color: c || undefined })}>{c ? "" : "×"}</button>)}
          <label className="ed-sw ed-sw-free" title="Escolher cor"><input type="color" value={st.color ?? "#ffffff"} onChange={(e) => setSt({ color: e.target.value })} /></label>
          <i />
          <select value={st.font ?? ""} onChange={(e) => setSt({ font: (e.target.value || undefined) as SlotStyle["font"] })}>{FONTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select value={st.lh ?? ""} title="Espaço entre linhas" onChange={(e) => setSt({ lh: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Linhas</option><option value="1">1,0</option><option value="1.3">1,3</option><option value="1.6">1,6</option><option value="2">2,0</option>
          </select>
          {cur && <button title="Voltar ao original" onClick={async () => { await supabase.from("content_blocks").delete().eq("page", `slot-${id}`); location.reload(); }}><Undo2 size={13} /></button>}
        </span>
      )}
    </span>
  );
}

/** Imagem/vídeo único editável. Devolve src/pos atuais, estilos visuais (filtro, giro, cantos, zoom) e o editor (colocar dentro de elemento com position:relative). */
export function useEImg(id: string, src: string, pos = "50% 50%"): { src: string; pos: string; video: boolean; fx: CSSProperties; zoom?: string | undefined; editor: ReactNode } {
  const { editMode } = useAuth();
  const { data } = useSlots();
  const save = useSaveSlot();
  const cur = data?.[id];
  const s = cur?.src ?? src;
  const p = cur?.pos ?? pos;
  const st = cur?.style ?? {};
  const video = cur ? cur.kind === "video" : /\.(mp4|webm|mov)(\?|$)/i.test(src);
  const doSave = (np: string, ns?: string, v?: boolean, nst?: SlotStyle) => save(id, { kind: (v ?? video) ? "video" : "image", content: "", src: ns ?? s, pos: np, style: nst ?? st });
  return {
    src: s, pos: p, video, fx: slotImgCss(st), zoom: st.zoom ? `${st.zoom}%` : undefined,
    editor: editMode ? <ImgEditor key={id} pos={p} st={st} onSave={doSave} /> : null,
  };
}

/** Imagem/vídeo editável pronto para usar como <img>/<video>. */
export function EImg({ id, src, pos, alt, className, style }: { id: string; src: string; pos?: string; alt?: string; className?: string; style?: CSSProperties }) {
  const m = useEImg(id, src, pos);
  const css: CSSProperties = { objectPosition: m.pos, ...style, ...m.fx, ...(m.zoom ? { transform: `${m.fx.transform ?? ""} scale(${parseInt(m.zoom) / 100})` } : {}) };
  return (
    <span className="ed-eimg">
      {m.video ? <video className={className} src={m.src} autoPlay muted loop playsInline style={css} /> : <img className={className} src={m.src} alt={alt ?? ""} style={css} />}
      {m.editor}
    </span>
  );
}

function ImgEditor({ pos, st, onSave }: { pos: string; st: SlotStyle; onSave: (pos: string, src?: string, video?: boolean, st?: SlotStyle) => void }) {
  const [picker, setPicker] = useState(false);
  const d = useRef<{ x: number; y: number; px: number; py: number; nx: number; ny: number } | null>(null);
  const [live, setLive] = useState<string | null>(null);
  const [px, py] = pos.split(" ").map((v) => parseFloat(v));
  const stop = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
  const set = (p: Partial<SlotStyle>) => onSave(pos, undefined, undefined, { ...st, ...p });
  const fIdx = FILTERS.findIndex((f) => f[0] === (st.filter ?? ""));
  const btn = (title: string, icon: ReactNode, fn: () => void) => <button className="ed-img-btn" title={title} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { stop(e); fn(); }}>{icon}</button>;
  return (
    <>
      <div className="ed-img-over" title="Arraste para posicionar a imagem"
        onClick={stop}
        onPointerDown={(e) => { stop(e); e.currentTarget.setPointerCapture(e.pointerId); d.current = { x: e.clientX, y: e.clientY, px: px ?? 50, py: py ?? 50, nx: px ?? 50, ny: py ?? 50 }; }}
        onPointerMove={(e) => { const r = d.current; if (!r) return; r.nx = Math.max(0, Math.min(100, r.px - (e.clientX - r.x) / 3)); r.ny = Math.max(0, Math.min(100, r.py - (e.clientY - r.y) / 3)); const v = `${Math.round(r.nx)}% ${Math.round(r.ny)}%`; setLive(v); const host = e.currentTarget.closest(".ed-eimg") ?? e.currentTarget.parentElement; if (host instanceof HTMLElement) { host.style.backgroundPosition = v; host.querySelectorAll<HTMLElement>("img,video").forEach((m) => (m.style.objectPosition = v)); } }}
        onPointerUp={() => { const r = d.current; d.current = null; setLive(null); if (r && (r.nx !== r.px || r.ny !== r.py)) onSave(`${Math.round(r.nx)}% ${Math.round(r.ny)}%`); }}>
        <div className="ed-img-bar">
          <button className="ed-img-btn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { stop(e); setPicker(true); }}><Replace size={14} /> Trocar</button>
          {btn("Aproximar", <ZoomIn size={14} />, () => set({ zoom: Math.min(300, (st.zoom ?? 100) + 20) }))}
          {btn("Afastar", <ZoomOut size={14} />, () => set({ zoom: Math.max(100, (st.zoom ?? 100) - 20) }))}
          {btn("Girar", <RotateCw size={14} />, () => set({ rotate: (((st.rotate ?? 0) + 3 + 9) % 18) - 9 }))}
          {btn("Cantos arredondados", <Square size={14} />, () => set({ radius: st.radius ? undefined : 18 }))}
          {btn("Filtro", <span className="ed-img-f">{FILTERS[(fIdx + 1) % FILTERS.length]![1]}</span>, () => set({ filter: FILTERS[(fIdx + 1) % FILTERS.length]![0] || undefined }))}
        </div>
        {live && <span className="ed-img-pos">{live}</span>}
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(url, v) => { setPicker(false); onSave(pos, url, v); }} />}
    </>
  );
}
