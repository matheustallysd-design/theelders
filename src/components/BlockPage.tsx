import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, Copy, ImagePlus, Italic, Move, Plus, RotateCcw, Save, Trash2, Type, Undo2, Replace, Zap, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mk, type Block } from "@/lib/blocks";
import { MediaPicker } from "./MediaPicker";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.15 });
    el.querySelectorAll(".bk").forEach((b) => io.observe(b));
    return () => io.disconnect();
  });
  return ref;
}

async function fetchBlocks(page: string): Promise<Block[] | null> {
  const { data, error } = await supabase.from("content_blocks").select("*").eq("page", page).order("position");
  if (error || !data?.length) return null;
  return data.map((r) => ({ id: r.id, kind: r.kind as Block["kind"], content: r.content, src: r.src, pos: r.pos, zoom: r.zoom, align: r.align as Block["align"], bold: r.bold, italic: r.italic, size: r.size as Block["size"] }));
}

export function BlockPage({ page, defaults, className }: { page: string; defaults: () => Block[]; className?: string }) {
  const qc = useQueryClient();
  const { editMode } = useAuth();
  const q = useQuery({ queryKey: ["blocks", page], queryFn: () => fetchBlocks(page) });
  const [draft, setDraft] = useState<Block[] | null>(null);
  const [history, setHistory] = useState<Block[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [picker, setPicker] = useState<null | { mode: "replace" | "add"; id: string }>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useReveal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const def = useMemo(() => defaults(), [page]);
  const base = q.data ?? def;
  const blocks = draft ?? base;
  const dirty = draft !== null;

  useEffect(() => { setDraft(null); setHistory([]); setSel(null); }, [page]);
  useEffect(() => { if (!editMode) setSel(null); }, [editMode]);

  const apply = (next: Block[]) => { setHistory((h) => [...h.slice(-49), blocks]); setDraft(next); };
  const update = (id: string, p: Partial<Block>) => apply(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)));
  const idx = (id: string) => blocks.findIndex((b) => b.id === id);
  const move = (id: string, d: -1 | 1) => { const i = idx(id), j = i + d; if (j < 0 || j >= blocks.length) return; const a = [...blocks]; [a[i], a[j]] = [a[j]!, a[i]!]; apply(a); };
  const insertAfter = (id: string, b: Block) => { const i = idx(id); const a = [...blocks]; a.splice(i + 1, 0, b); apply(a); setSel(b.id); };
  const remove = (id: string) => { apply(blocks.filter((b) => b.id !== id)); setSel(null); };
  const undo = () => { const h = [...history]; const prev = h.pop(); if (!prev) return; setHistory(h); setDraft(prev); };

  const save = async () => {
    setSaving(true);
    const rows = blocks.map((b, i) => ({ page, position: i, kind: b.kind, content: b.content, src: b.src, pos: b.pos, zoom: b.zoom, align: b.align, bold: b.bold, italic: b.italic, size: b.size }));
    const del = await supabase.from("content_blocks").delete().eq("page", page);
    const ins = del.error ? del : await supabase.from("content_blocks").insert(rows);
    setSaving(false);
    if (ins.error) { toast.error("Não foi possível salvar: " + ins.error.message); return; }
    await qc.invalidateQueries({ queryKey: ["blocks", page] });
    setDraft(null); setHistory([]); toast.success("Página salva para todos os leitores");
  };
  const reset = () => { if (confirm("Voltar ao conteúdo original desta página? (só vale depois de salvar)")) apply(defaults()); };

  return (
    <div ref={ref} className={`bk-page ${editMode ? "editing" : ""} ${className ?? ""}`}>
      {blocks.map((b) => (
        <BlockView key={b.id} b={b} editing={editMode} selected={sel === b.id}
          onSelect={() => editMode && setSel(b.id)}
          onOpen={(src) => !editMode && setLightbox(src)}
          onChange={(p) => update(b.id, p)}>
          {editMode && sel === b.id && (
            <Toolbar b={b}
              onChange={(p) => update(b.id, p)} onUp={() => move(b.id, -1)} onDown={() => move(b.id, 1)}
              onDup={() => insertAfter(b.id, { ...b, id: mk({ kind: b.kind }).id })} onDel={() => remove(b.id)}
              onAddText={() => insertAfter(b.id, mk({ kind: "text", content: "Novo texto..." }))}
              onAddSfx={() => insertAfter(b.id, mk({ kind: "sfx", content: "BOOM!", align: "center" }))}
              onAddImage={() => setPicker({ mode: "add", id: b.id })}
              onReplace={() => setPicker({ mode: "replace", id: b.id })} />
          )}
        </BlockView>
      ))}
      {editMode && (
        <div className="ed-bar">
          <span>{dirty ? "Alterações não salvas" : "Modo edição — clique em um texto ou imagem"}</span>
          <button onClick={undo} disabled={!history.length}><Undo2 size={15} /> Desfazer</button>
          <button onClick={reset}><RotateCcw size={15} /> Original</button>
          <button onClick={() => { setDraft(null); setHistory([]); }} disabled={!dirty}><X size={15} /> Descartar</button>
          <button className="ed-save" onClick={save} disabled={!dirty || saving}><Save size={15} /> {saving ? "Salvando..." : "Salvar"}</button>
        </div>
      )}
      {picker && <MediaPicker onClose={() => setPicker(null)} onPick={(url, video) => {
        if (picker.mode === "replace") update(picker.id, { src: url, kind: video ? "video" : "image" });
        else insertAfter(picker.id, mk({ kind: video ? "video" : "image", src: url }));
        setPicker(null);
      }} />}
      {lightbox && <div className="bk-lightbox" onClick={() => setLightbox(null)}><img src={lightbox} alt="Arte ampliada" /></div>}
    </div>
  );
}

function BlockView({ b, editing, selected, onSelect, onOpen, onChange, children }: {
  b: Block; editing: boolean; selected: boolean; onSelect: () => void; onOpen: (src: string) => void; onChange: (p: Partial<Block>) => void; children?: React.ReactNode;
}) {
  const cls = `bk bk-${b.kind} bk-${b.align} bk-size-${b.size} ${selected ? "sel" : ""}`;
  const txtStyle: CSSProperties = { fontWeight: b.bold ? 700 : undefined, fontStyle: b.italic ? "italic" : undefined, textAlign: b.align };
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  if (b.kind === "image" || b.kind === "video") {
    const [px, py] = b.pos.split(" ").map((v) => parseFloat(v));
    const onDown = (e: React.PointerEvent) => { if (!selected) return; dragRef.current = { x: e.clientX, y: e.clientY, px: px ?? 50, py: py ?? 50 }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
    const onMove = (e: React.PointerEvent) => { const d = dragRef.current; if (!d) return; const nx = Math.max(0, Math.min(100, d.px - (e.clientX - d.x) / 4)); const ny = Math.max(0, Math.min(100, d.py - (e.clientY - d.y) / 4)); (e.currentTarget as HTMLElement).style.backgroundPosition = `${nx}% ${ny}%`; };
    const onUp = (e: React.PointerEvent) => { const d = dragRef.current; dragRef.current = null; if (!d) return; const nx = Math.max(0, Math.min(100, d.px - (e.clientX - d.x) / 4)); const ny = Math.max(0, Math.min(100, d.py - (e.clientY - d.y) / 4)); onChange({ pos: `${Math.round(nx)}% ${Math.round(ny)}%` }); };
    const size = b.zoom <= 100 ? "contain" : `${b.zoom}%`;
    return (
      <figure className={cls} onClick={onSelect}>
        {children}
        <div className={`mg-panel bk-frame ${b.zoom <= 100 ? "bk-full" : ""}`}>
          {b.kind === "video" ? <video src={b.src ?? ""} autoPlay muted loop playsInline style={{ objectPosition: b.pos }} />
            : b.zoom <= 100 ? <img src={b.src ?? ""} alt={b.content || "Arte de THE ELDER"} loading="lazy" onClick={() => onOpen(b.src ?? "")} />
            : <div className="bk-crop" role="img" aria-label={b.content || "Recorte de arte"} style={{ backgroundImage: `url(${b.src})`, backgroundPosition: b.pos, backgroundSize: size, cursor: selected ? "move" : "zoom-in" }}
                onClick={() => onOpen(b.src ?? "")} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />}
        </div>
        {(b.content || (editing && selected)) && (
          <figcaption className="mg-caption" contentEditable={editing && selected} suppressContentEditableWarning
            onBlur={(e) => e.currentTarget.textContent !== b.content && onChange({ content: e.currentTarget.textContent ?? "" })}>{b.content}</figcaption>
        )}
      </figure>
    );
  }

  const Tag = b.kind === "quote" ? "blockquote" : "div";
  return (
    <Tag className={cls} onClick={onSelect}>
      {children}
      <div className={b.kind === "quote" ? "mg-bubble" : b.kind === "sfx" ? "mg-sfx bk-sfx-t" : "bk-text"} style={txtStyle}
        contentEditable={editing && selected} suppressContentEditableWarning
        onBlur={(e) => { const v = e.currentTarget.innerText; if (v !== b.content) onChange({ content: v }); }}>
        {b.content}
      </div>
    </Tag>
  );
}

function Toolbar({ b, onChange, onUp, onDown, onDup, onDel, onAddText, onAddSfx, onAddImage, onReplace }: {
  b: Block; onChange: (p: Partial<Block>) => void; onUp: () => void; onDown: () => void; onDup: () => void; onDel: () => void; onAddText: () => void; onAddSfx: () => void; onAddImage: () => void; onReplace: () => void;
}) {
  const media = b.kind === "image" || b.kind === "video";
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const sizes: Block["size"][] = ["sm", "md", "lg"];
  return (
    <div className="ed-tools" onClick={stop} onMouseDown={(e) => e.preventDefault()}>
      {!media && <>
        <button title="Negrito" className={b.bold ? "on" : ""} onClick={() => onChange({ bold: !b.bold })}><Bold size={15} /></button>
        <button title="Itálico" className={b.italic ? "on" : ""} onClick={() => onChange({ italic: !b.italic })}><Italic size={15} /></button>
        <button title="Tamanho" onClick={() => onChange({ size: sizes[(sizes.indexOf(b.size) + 1) % 3]! })}><Type size={15} /> {b.size.toUpperCase()}</button>
      </>}
      {media && <>
        <button title="Trocar imagem" onClick={onReplace}><Replace size={15} /></button>
        {b.kind === "image" && <label className="ed-zoom" title="Zoom (100 = imagem inteira)"><Move size={14} />
          <input type="range" min={100} max={500} step={10} value={b.zoom} onChange={(e) => onChange({ zoom: Number(e.target.value) })} /></label>}
      </>}
      <i />
      <button title="Esquerda" className={b.align === "left" ? "on" : ""} onClick={() => onChange({ align: "left" })}><AlignLeft size={15} /></button>
      <button title="Centro" className={b.align === "center" ? "on" : ""} onClick={() => onChange({ align: "center" })}><AlignCenter size={15} /></button>
      <button title="Direita" className={b.align === "right" ? "on" : ""} onClick={() => onChange({ align: "right" })}><AlignRight size={15} /></button>
      <i />
      <button title="Subir" onClick={onUp}><ArrowUp size={15} /></button>
      <button title="Descer" onClick={onDown}><ArrowDown size={15} /></button>
      <button title="Duplicar" onClick={onDup}><Copy size={15} /></button>
      <button title="Apagar" onClick={onDel}><Trash2 size={15} /></button>
      <i />
      <button title="Adicionar texto abaixo" onClick={onAddText}><Plus size={13} /><Type size={14} /></button>
      <button title="Adicionar imagem abaixo" onClick={onAddImage}><ImagePlus size={15} /></button>
      <button title="Adicionar onomatopeia" onClick={onAddSfx}><Zap size={15} /></button>
    </div>
  );
}
