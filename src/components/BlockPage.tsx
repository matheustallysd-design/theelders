import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  GripVertical,
  ImagePlus,
  Italic,
  MessageCircle,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Type,
  Undo2,
  Replace,
  Zap,
  X,
  Palette,
  Square,
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { blockToRow, rowToBlock, type BlockRow } from "@/lib/blockRows";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mk, type Block } from "@/lib/blocks";
import { MediaPicker, type MediaType } from "./MediaPicker";
import { Glossed } from "./Glossary";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".bk:not(.revealed)");
    if (!items.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  });
  return ref;
}

/** A tabela content_blocks guarda um registro por bloco, em ordem pela coluna position. */
async function fetchBlocks(page: string): Promise<Block[] | null> {
  const { data, error } = await supabase.from("content_blocks").select("*").eq("page", page).order("position");
  if (error) { console.error("Erro ao carregar os blocos da página:", error); throw error; }
  if (!data?.length) return null;
  return data.map((r) => rowToBlock(r as BlockRow));
}

export function BlockPage({
  page,
  defaults,
  className,
}: {
  page: string;
  defaults: () => Block[];
  className?: string;
}) {
  const qc = useQueryClient();
  const { editMode } = useAuth();
  const q = useQuery({
    queryKey: ["blocks", page],
    queryFn: () => fetchBlocks(page),
    staleTime: 0,
  });
  const [draft, setDraft] = useState<Block[] | null>(null);
  const [history, setHistory] = useState<Block[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [dragTarget, setDragTarget] = useState<{ id: string; pos: "top" | "bottom" } | null>(null);
  const dragId = useRef<string | null>(null);
  const [picker, setPicker] = useState<null | { mode: "replace" | "add"; id: string; type?: MediaType }>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useReveal();

  const def = useMemo(() => defaults(), [page]);
  const blocks = draft ?? q.data ?? def;
  const dirty = draft !== null;

  useEffect(() => {
    setDraft(null);
    setHistory([]);
    setSel(null);
  }, [page]);
  useEffect(() => {
    if (!editMode) setSel(null);
  }, [editMode]);
  useEffect(() => {
    setWriting(false);
  }, [sel]);

  const apply = (next: Block[]) => {
    setHistory((h) => [...h.slice(-49), blocks]);
    setDraft(next);
  };
  const update = (id: string, p: Partial<Block>) =>
    apply(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)));
  const idx = (id: string) => blocks.findIndex((b) => b.id === id);
  const move = (id: string, d: -1 | 1) => {
    const i = idx(id),
      j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const a = [...blocks];
    [a[i], a[j]] = [a[j]!, a[i]!];
    apply(a);
  };
  const moveTo = (from: string, to: string, pos: "top" | "bottom" = "top") => {
    if (from === to) return;
    const a = [...blocks];
    const fromIdx = a.findIndex((b) => b.id === from);
    if (fromIdx < 0) return;
    const [item] = a.splice(fromIdx, 1);
    if (!item) return;
    const toIdx = a.findIndex((b) => b.id === to);
    if (toIdx < 0) return;
    const targetIdx = pos === "bottom" ? toIdx + 1 : toIdx;
    a.splice(targetIdx, 0, item);
    apply(a);
    setSel(item.id);
  };
  const insertAfter = (id: string, b: Block) => {
    const i = idx(id);
    const a = [...blocks];
    a.splice(i + 1, 0, b);
    apply(a);
    setSel(b.id);
  };
  const remove = (id: string) => {
    apply(blocks.filter((b) => b.id !== id));
    setSel(null);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1]!;
    setHistory((h) => h.slice(0, -1));
    setDraft(prev);
  };

  const resetOriginal = async () => {
    if (!confirm("Restaurar o conteúdo original desta página?")) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("content_blocks").delete().eq("page", page);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["blocks", page] });
      setDraft(null);
      setHistory([]);
      setSel(null);
      toast.success("Conteúdo original restaurado.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao restaurar.");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!draft || saving) return;

    // Mantém uma cópia estável do conteúdo enviado ao Supabase.
    const snapshot = draft;
    setSaving(true);

    try {
      const del = await supabase.from("content_blocks").delete().eq("page", page);
      if (del.error) throw del.error;
      const rows = snapshot.map((b, i) => blockToRow(b, page, i));
      const { error } = rows.length ? await supabase.from("content_blocks").insert(rows as never) : { error: null };
      if (error) throw error;

      await qc.invalidateQueries({ queryKey: ["blocks", page] });

      setDraft(null);
      setHistory([]);
      toast.success("Alterações salvas no banco de dados!");
    } catch (e: unknown) {
      console.error("Erro ao salvar os blocos:", e);
      const message =
        e instanceof Error ? e.message : "Falha ao salvar as alterações.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!editMode) return;
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".ed-tools") || t.closest(".ed-bar") || t.closest(".ed-grip") || t.closest(".ed-resize"))
        return;
      if (!t.closest(".bk")) {
        setSel(null);
      }
    };
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      } else if (e.key === "Escape") {
        setSel(null);
      }
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [editMode, dirty, blocks, history]);

  const selected = blocks.find((b) => b.id === sel);

  return (
    <div ref={ref} className={`bk-page ${editMode ? "editing" : ""} ${className ?? ""}`}>
      {blocks.map((b) => (
        <BlockView
          key={b.id}
          b={b}
          editing={editMode}
          selected={sel === b.id}
          writing={writing && sel === b.id}
          dropPos={dragTarget?.id === b.id ? dragTarget.pos : null}
          onSelect={() => {
            if (!editMode) return;
            if (sel === b.id) setWriting(true);
            else setSel(b.id);
          }}
          onOpen={(src) => !editMode && setLightbox(src)}
          onChange={(p) => update(b.id, p)}
          onDragStart={() => {
            dragId.current = b.id;
          }}
          onDragOver={(pos) => {
            if (dragId.current && dragId.current !== b.id) {
              setDragTarget({ id: b.id, pos });
            }
          }}
          onDragLeave={() => {
            if (dragTarget?.id === b.id) {
              setDragTarget(null);
            }
          }}
          onDrop={() => {
            if (dragId.current && dragTarget?.id === b.id) {
              moveTo(dragId.current, b.id, dragTarget.pos);
            }
            dragId.current = null;
            setDragTarget(null);
          }}
        />
      ))}

      {editMode && selected && (
        <Toolbar
          b={selected}
          onChange={(p) => update(selected.id, p)}
          onUp={() => move(selected.id, -1)}
          onDown={() => move(selected.id, 1)}
          onDup={() => insertAfter(selected.id, { ...selected, id: mk({ kind: selected.kind }).id })}
          onDel={() => remove(selected.id)}
          onAdd={(k) =>
            insertAfter(
              selected.id,
              mk({
                kind: k,
                content:
                  k === "text"
                    ? "Novo parágrafo..."
                    : k === "quote"
                    ? "Nova fala..."
                    : k === "sfx"
                    ? "ZAN!"
                    : "",
              })
            )
          }
          onAddImage={() => setPicker({ mode: "add", id: selected.id, type: "visual" })}
          onAddAudio={() => setPicker({ mode: "add", id: selected.id, type: "audio" })}
          onReplace={() =>
            setPicker({
              mode: "replace",
              id: selected.id,
              type: selected.kind === "audio" ? "audio" : "visual",
            })
          }
        />
      )}

      {editMode && (
        <div className="ed-bar">
          <div className="ed-info">
            <b>MODO EDIÇÃO</b>
            <span>{dirty ? "✦ Alterações pendentes" : "Pronto para editar"}</span>
          </div>
          <div className="ed-actions">
            <button
              onClick={() => {
                const b = mk({ kind: "text", content: "Novo texto..." });
                apply([...blocks, b]);
                setSel(b.id);
              }}
              title="Adicionar parágrafo no final"
            >
              <Plus size={15} /> Texto
            </button>
            <button
              onClick={() => setPicker({ mode: "add", id: blocks[blocks.length - 1]?.id ?? "end", type: "visual" })}
              title="Adicionar imagem ou vídeo"
            >
              <ImagePlus size={15} /> Imagem
            </button>
            <button
              onClick={() => setPicker({ mode: "add", id: blocks[blocks.length - 1]?.id ?? "end", type: "audio" })}
              title="Adicionar áudio ou dublagem"
            >
              <Headphones size={15} /> Áudio
            </button>
            <button onClick={undo} disabled={!history.length} title="Desfazer (Ctrl+Z)">
              <Undo2 size={15} />
            </button>
            <button onClick={resetOriginal} disabled={saving} title="Restaurar conteúdo original">
              <RotateCcw size={15} /> Original
            </button>
            <button className="ed-save" onClick={save} disabled={!dirty || saving} title="Salvar (Ctrl+S)">
              <Save size={15} /> {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {picker && (
        <MediaPicker
          type={picker.type ?? "visual"}
          onClose={() => setPicker(null)}
          onSelect={(url, kind, label) => {
            if (picker.mode === "replace") {
              if (picker.type === "audio") {
                update(picker.id, {
                  src: url,
                  audioMode: kind === "bgm" ? "bgm" : "voice",
                  label: label || undefined,
                });
              } else {
                update(picker.id, { src: url, kind: kind === "video" ? "video" : "image" });
              }
            } else {
              const prev = blocks.find((b) => b.id === picker.id);
              if (picker.type === "audio") {
                const b = mk({
                  kind: "audio",
                  src: url,
                  audioMode: kind === "bgm" ? "bgm" : "voice",
                  label: label || (kind === "bgm" ? "Trilha Sonora" : "Dublagem"),
                  volume: 0.8,
                });
                if (prev) insertAfter(prev.id, b);
                else apply([...blocks, b]);
              } else {
                const b = mk({
                  kind: kind === "video" ? "video" : "image",
                  src: url,
                  frame: "straight",
                  size: "md",
                });
                if (prev) insertAfter(prev.id, b);
                else apply([...blocks, b]);
              }
            }
            setPicker(null);
          }}
        />
      )}

      {lightbox && (
        <div className="mg-lightbox" onClick={() => setLightbox(null)}>
          <button className="mg-lightbox-close" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          <img src={lightbox} alt="Arte expandida" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function BlockView({
  b,
  editing,
  selected,
  writing,
  dropPos,
  onSelect,
  onOpen,
  onChange,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  b: Block;
  editing: boolean;
  selected: boolean;
  writing: boolean;
  dropPos: "top" | "bottom" | null;
  onSelect: () => void;
  onOpen: (src: string) => void;
  onChange: (p: Partial<Block>) => void;
  onDragStart: () => void;
  onDragOver: (pos: "top" | "bottom") => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  const cls = `bk bk-${b.kind} bk-${b.align} bk-size-${b.size} bk-c-${b.color} bk-f-${b.font} bk-fr-${b.frame} ${
    selected ? "sel" : ""
  } ${dropPos ? `drop-${dropPos}` : ""}`;
  const style: CSSProperties =
    b.width < 100
      ? {
          width: `${b.width}%`,
          marginLeft: b.align === "center" ? "auto" : undefined,
          marginRight: b.align === "center" ? "auto" : undefined,
        }
      : {};
  const txtStyle: CSSProperties = {
    fontWeight: b.bold ? 700 : undefined,
    fontStyle: b.italic ? "italic" : undefined,
    textAlign: b.align,
  };
  const dragRef = useRef<{ x: number; y: number; px: number; py: number; el: HTMLElement } | null>(null);
  const hostRef = useRef<HTMLElement>(null);

  const dnd = editing
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          onDragOver(e.clientY < mid ? "top" : "bottom");
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onDragLeave();
          }
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          onDrop();
        },
      }
    : {};

  const handles = editing ? (
    <>
      <span
        className="ed-grip"
        draggable
        title="Clique e arraste para reordenar o bloco na cena"
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", b.id);
          onDragStart();
        }}
      >
        <GripVertical size={14} />
        <span className="ed-grip-text">MOVER</span>
      </span>
      {selected && (
        <span
          className="ed-resize"
          title="Arraste para mudar a largura"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const host = hostRef.current;
            const parent = host?.parentElement;
            if (!host || !parent) return;
            const pw = parent.getBoundingClientRect().width;
            const start = e.clientX;
            const w0 = host.getBoundingClientRect().width;
            let w = b.width;
            const mv = (ev: PointerEvent) => {
              w = Math.round(clamp(((w0 + (ev.clientX - start) * (b.align === "right" ? -1 : 1)) / pw) * 100, 25, 100));
              host.style.width = `${w}%`;
            };
            const up = () => {
              window.removeEventListener("pointermove", mv);
              window.removeEventListener("pointerup", up);
              if (w !== b.width) onChange({ width: w });
            };
            window.addEventListener("pointermove", mv);
            window.addEventListener("pointerup", up);
          }}
        />
      )}
    </>
  ) : null;

  if (b.kind === "divider") {
    return (
      <div ref={hostRef as React.RefObject<HTMLDivElement>} className={cls} style={style} onClick={onSelect} {...dnd}>
        {handles}
        <hr className="bk-divider" />
      </div>
    );
  }

  if (b.kind === "audio") {
    return (
      <div ref={hostRef as React.RefObject<HTMLDivElement>} className={`${cls} bk-audio-block`} style={style} onClick={onSelect} {...dnd}>
        {handles}
        <MangaAudioPlayer b={b} editing={editing} onChange={onChange} />
      </div>
    );
  }

  if (b.kind === "image" || b.kind === "video") {
    const [px, py] = b.pos.split(" ").map((v) => parseFloat(v));
    const cropped = b.kind === "image" && b.zoom > 100;
    const onDown = (e: React.PointerEvent) => {
      if (!selected) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      dragRef.current = { x: e.clientX, y: e.clientY, px: px ?? 50, py: py ?? 50, el };
    };
    const calc = (e: React.PointerEvent) => {
      const d = dragRef.current!;
      return [clamp(d.px - (e.clientX - d.x) / 3, 0, 100), clamp(d.py - (e.clientY - d.y) / 3, 0, 100)] as const;
    };
    const onMove = (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const [nx, ny] = calc(e);
      const v = `${nx}% ${ny}%`;
      const el = dragRef.current.el;
      el.style.backgroundPosition = v;
      el.style.objectPosition = v;
    };
    const onUp = (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const [nx, ny] = calc(e);
      const moved = Math.abs(e.clientX - dragRef.current.x) + Math.abs(e.clientY - dragRef.current.y) > 3;
      dragRef.current = null;
      if (moved) onChange({ pos: `${nx}% ${ny}%` });
    };

    return (
      <figure
        ref={hostRef as React.RefObject<HTMLElement>}
        className={cls}
        style={style}
        onClick={onSelect}
        onDoubleClick={() => !editing && b.kind === "image" && onOpen(b.src)}
        {...dnd}
      >
        {handles}
        <div className="bk-frame">
          {b.kind === "video" ? (
            <video
              src={b.src}
              autoPlay
              loop
              muted
              playsInline
              style={{ objectPosition: b.pos }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          ) : cropped ? (
            <div
              className="bk-crop"
              style={{
                backgroundImage: `url(${b.src})`,
                backgroundPosition: b.pos,
                backgroundSize: `${b.zoom}%`,
              }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          ) : (
            <img
              src={b.src}
              alt={b.caption || "Cena"}
              loading="lazy"
              draggable={false}
              style={{ objectPosition: b.pos }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          )}
        </div>
        {(b.caption || (editing && selected)) && (
          <figcaption
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) => onChange({ caption: e.currentTarget.innerText })}
          >
            {b.caption || (editing ? "Legenda..." : "")}
          </figcaption>
        )}
      </figure>
    );
  }

  const Tag = b.kind === "onomatopoeia" ? "div" : "p";
  return (
    <Tag ref={hostRef as React.RefObject<HTMLParagraphElement>} className={cls} style={style} onClick={onSelect} {...dnd}>
      {handles}
      <div
        className={b.kind === "quote" ? "mg-bubble" : b.kind === "sfx" ? "mg-sfx bk-sfx-t" : "bk-text"}
        style={txtStyle}
        contentEditable={writing}
        suppressContentEditableWarning
        ref={(el) => {
          if (el && writing && document.activeElement !== el) el.focus();
        }}
        onBlur={(e) => {
          const v = e.currentTarget.innerText;
          if (v !== b.content) onChange({ content: v });
        }}
      >
        {writing || editing || b.kind !== "text" ? b.content : <Glossed text={b.content} />}
      </div>
    </Tag>
  );
}

const colors: Block["color"][] = ["default", "blood", "arcane", "gold", "paper"];
const fonts: Block["font"][] = ["body", "manga", "title"];
const frames: Block["frame"][] = ["straight", "slant", "none"];
const label = {
  body: "Normal",
  manga: "Mangá",
  title: "Título",
  straight: "Reto",
  slant: "Inclinado",
  none: "Sem borda",
} as const;
const next = <T,>(arr: T[], v: T) => arr[(arr.indexOf(v) + 1) % arr.length]!;

function Toolbar({
  b,
  onChange,
  onUp,
  onDown,
  onDup,
  onDel,
  onAdd,
  onAddImage,
  onAddAudio,
  onReplace,
}: {
  b: Block;
  onChange: (p: Partial<Block>) => void;
  onUp: () => void;
  onDown: () => void;
  onDup: () => void;
  onDel: () => void;
  onAdd: (k: "text" | "sfx" | "quote" | "divider") => void;
  onAddImage: () => void;
  onAddAudio: () => void;
  onReplace: () => void;
}) {
  const media = b.kind === "image" || b.kind === "video";
  const isAudio = b.kind === "audio";
  const sizes: Block["size"][] = ["sm", "md", "lg"];

  return (
    <div
      className="ed-tools"
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).closest("input")) e.preventDefault();
      }}
    >
      {isAudio && (
        <>
          <button title="Trocar áudio" onClick={onReplace}>
            <Replace size={15} /> Trocar Áudio
          </button>
          <button
            title="Alternar modo de áudio"
            onClick={() => onChange({ audioMode: b.audioMode === "bgm" ? "voice" : "bgm" })}
          >
            {b.audioMode === "bgm" ? "♫ Trilha Sonora" : "✦ Dublagem"}
          </button>
        </>
      )}

      {media && (
        <>
          <button title="Trocar mídia" onClick={onReplace}>
            <Replace size={15} /> Trocar
          </button>
          <button
            title="Mudar tamanho do quadro"
            onClick={() => onChange({ size: next(sizes, b.size) })}
          >
            Tam: {b.size.toUpperCase()}
          </button>
          <button
            title="Estilo da borda"
            onClick={() => onChange({ frame: next(frames, b.frame) })}
          >
            <Square size={14} /> {label[b.frame]}
          </button>
          {b.kind === "image" && (
            <label className="ed-zoom" title="Aproximar e enquadrar">
              <span>Zoom</span>
              <input
                type="range"
                min="100"
                max="300"
                step="10"
                value={b.zoom}
                onChange={(e) => onChange({ zoom: parseInt(e.target.value) || 100 })}
              />
              <small>{b.zoom}%</small>
            </label>
          )}
        </>
      )}

      {!media && !isAudio && b.kind !== "divider" && (
        <>
          <button
            className={b.bold ? "on" : ""}
            title="Negrito"
            onClick={() => onChange({ bold: !b.bold })}
          >
            <Bold size={15} />
          </button>
          <button
            className={b.italic ? "on" : ""}
            title="Itálico"
            onClick={() => onChange({ italic: !b.italic })}
          >
            <Italic size={15} />
          </button>
          <button
            title="Fonte"
            onClick={() => onChange({ font: next(fonts, b.font) })}
          >
            <Type size={15} /> {label[b.font]}
          </button>
          <button
            title="Cor temática"
            onClick={() => onChange({ color: next(colors, b.color) })}
          >
            <Palette size={15} /> <span className={`ed-dot bk-c-${b.color}`} />
          </button>
        </>
      )}

      <button
        className={b.align === "left" ? "on" : ""}
        title="Alinhar à esquerda"
        onClick={() => onChange({ align: "left" })}
      >
        <AlignLeft size={15} />
      </button>
      <button
        className={b.align === "center" ? "on" : ""}
        title="Centralizar"
        onClick={() => onChange({ align: "center" })}
      >
        <AlignCenter size={15} />
      </button>
      <button
        className={b.align === "right" ? "on" : ""}
        title="Alinhar à direita"
        onClick={() => onChange({ align: "right" })}
      >
        <AlignRight size={15} />
      </button>

      <span className="ed-sep" />

      <button title="Subir" onClick={onUp}>
        <ArrowUp size={15} />
      </button>
      <button title="Descer" onClick={onDown}>
        <ArrowDown size={15} />
      </button>
      <button title="Duplicar" onClick={onDup}>
        <Copy size={15} />
      </button>
      <button className="ed-del" title="Excluir" onClick={onDel}>
        <Trash2 size={15} />
      </button>

      <span className="ed-sep" />

      <button title="Inserir texto abaixo" onClick={() => onAdd("text")}>
        <Plus size={14} /> Texto
      </button>
      <button title="Inserir onomatopeia" onClick={() => onAdd("sfx")}>
        <Zap size={14} /> SFX
      </button>
      <button title="Inserir balão" onClick={() => onAdd("quote")}>
        <MessageCircle size={14} /> Balão
      </button>
      <button title="Inserir divisor de cena" onClick={() => onAdd("divider")}>
        <Minus size={14} /> Linha
      </button>
      <button title="Inserir imagem abaixo" onClick={onAddImage}>
        <ImagePlus size={14} /> Imagem
      </button>
      <button title="Inserir áudio abaixo" onClick={onAddAudio}>
        <Headphones size={14} /> Áudio
      </button>
    </div>
  );
}

function MangaAudioPlayer({
  b,
  editing,
  onChange,
}: {
  b: Block;
  editing: boolean;
  onChange: (p: Partial<Block>) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const isBgm = b.audioMode === "bgm";
  const defaultLabel = isBgm ? "Trilha Sonora Original" : "Dublagem da Cena";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = b.volume ?? 0.8;
  }, [b.volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`mg-audio-wrap ${isBgm ? "is-bgm" : "is-voice"}`}>
      <audio
        ref={audioRef}
        src={b.src}
        loop={isBgm}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />
      <div className="mg-audio-inner">
        <button
          className={`mg-audio-play ${playing ? "on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          title={playing ? "Pausar" : "Ouvir"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="mg-audio-meta">
          <div className="mg-audio-header">
            <span className="mg-audio-badge">
              {isBgm ? "♫ TRILHA SONORA" : "✦ DUBLAGEM"}
            </span>
            <span
              className="mg-audio-title"
              contentEditable={editing}
              suppressContentEditableWarning
              onBlur={(e) => onChange({ label: e.currentTarget.innerText })}
            >
              {b.label || defaultLabel}
            </span>
          </div>

          <div className="mg-audio-track" onClick={onSeek}>
            <div className="mg-audio-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="mg-audio-footer">
            <small>
              {formatTime((duration * progress) / 100)} / {formatTime(duration)}
            </small>
            <button
              className="mg-audio-vol"
              onClick={(e) => {
                e.stopPropagation();
                if (audioRef.current) {
                  audioRef.current.muted = !muted;
                  setMuted(!muted);
                }
              }}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
