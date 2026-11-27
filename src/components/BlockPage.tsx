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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { mk, type Block } from "@/lib/blocks";
import { MediaPicker, type MediaType } from "./MediaPicker";
import { Glossed } from "./Glossary";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), {
      threshold: 0.15,
    });
    el.querySelectorAll(".bk").forEach((b) => io.observe(b));
    return () => io.disconnect();
  });
  return ref;
}

async function fetchBlocks(page: string): Promise<Block[] | null> {
  const { data, error } = await supabase.from("content_blocks").select("*").eq("page", page).order("position");
  if (error || !data?.length) return null;
  return data.map((r) => ({
    id: r.id,
    kind: r.kind as Block["kind"],
    content: r.content,
    src: r.src,
    pos: r.pos,
    zoom: r.zoom,
    align: r.align as Block["align"],
    bold: r.bold,
    italic: r.italic,
    size: r.size as Block["size"],
    width: r.width ?? 100,
    color: (r.color ?? "default") as Block["color"],
    font: (r.font ?? "body") as Block["font"],
    frame: (r.frame ?? "straight") as Block["frame"],
  }));
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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
  const q = useQuery({ queryKey: ["blocks", page], queryFn: () => fetchBlocks(page) });
  const [draft, setDraft] = useState<Block[] | null>(null);
  const [history, setHistory] = useState<Block[][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const [picker, setPicker] = useState<null | { mode: "replace" | "add"; id: string }>(null);
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
  const moveTo = (from: string, to: string) => {
    if (from === to) return;
    const a = blocks.filter((b) => b.id !== from);
    const item = blocks[idx(from)];
    if (!item) return;
    a.splice(a.findIndex((b) => b.id === to), 0, item);
    apply(a);
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
    const h = [...history];
    const prev = h.pop();
    if (!prev) return;
    setHistory(h);
    setDraft(prev);
  };

  const save = async () => {
    setSaving(true);
    const rows = blocks.map((b, i) => ({
      page,
      position: i,
      kind: b.kind,
      content: b.content,
      src: b.src,
      pos: b.pos,
      zoom: b.zoom,
      align: b.align,
      bold: b.bold,
      italic: b.italic,
      size: b.size,
      width: b.width,
      color: b.color,
      font: b.font,
      frame: b.frame,
    }));
    const del = await supabase.from("content_blocks").delete().eq("page", page);
    const ins = del.error ? del : await supabase.from("content_blocks").insert(rows);
    setSaving(false);
    if (ins.error) {
      toast.error("Não foi possível salvar: " + ins.error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["blocks", page] });
    setDraft(null);
    setHistory([]);
    toast.success("Página salva para todos os leitores");
  };
  const reset = () => {
    if (confirm("Voltar ao conteúdo original desta página?")) apply(defaults());
  };

  const latest = useRef({ undo, save, remove, sel, writing, dirty });
  latest.current = { undo, save, remove, sel, writing, dirty };
  useEffect(() => {
    if (!editMode) return;
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".bk") && !t.closest(".ed-tools") && !t.closest(".ed-bar") && !t.closest(".ed-modal"))
        setSel(null);
    };
    const key = (e: KeyboardEvent) => {
      const L = latest.current;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (L.dirty) L.save();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !L.writing) {
        e.preventDefault();
        L.undo();
      } else if (e.key === "Delete" && L.sel && !L.writing) {
        e.preventDefault();
        L.remove(L.sel);
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
  }, [editMode]);

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
          over={dragOver === b.id}
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
          onDragOver={() => setDragOver(b.id)}
          onDrop={() => {
            if (dragId.current) moveTo(dragId.current, b.id);
            dragId.current = null;
            setDragOver(null);
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
              mk(
                k === "text"
                  ? { kind: "text", content: "Novo texto..." }
                  : k === "sfx"
                  ? { kind: "sfx", content: "BOOM!", align: "center", font: "manga" }
                  : k === "quote"
                  ? { kind: "quote", content: "Fala do personagem...", align: "center" }
                  : { kind: "divider", align: "center" }
              )
            )
          }
          onAddImage={() => setPicker({ mode: "add", id: selected.id })}
          onAddAudio={() =>
            insertAfter(
              selected.id,
              mk({
                kind: "audio",
                content: "Dublagem da Cena",
                pos: "voice",
                zoom: 100,
                align: "center",
              })
            )
          }
          onReplace={() => setPicker({ mode: "replace", id: selected.id })}
        />
      )}

      {editMode && blocks.length === 0 && (
        <div className="ed-empty">
          <button onClick={() => { const b = mk({ kind: "text", content: "Novo texto..." }); apply([b]); setSel(b.id); }}>
            <Type size={14} /> Adicionar texto aqui
          </button>
          <button onClick={() => { const b = mk({ kind: "sfx", content: "BOOM!", align: "center", font: "manga" }); apply([b]); setSel(b.id); }}>
            <Zap size={14} /> Onomatopeia
          </button>
          <button onClick={() => { const b = mk({ kind: "quote", content: "Fala do personagem...", align: "center" }); apply([b]); setSel(b.id); }}>
            <MessageCircle size={14} /> Balão
          </button>
          <button onClick={() => { const b = mk({ kind: "audio", content: "Dublagem da Cena", pos: "voice", align: "center" }); apply([b]); setSel(b.id); }}>
            <Headphones size={14} /> Áudio / Dublagem
          </button>
        </div>
      )}

      {editMode && (dirty || sel || !className?.includes("bk-quiet")) && (blocks.length > 0 || dirty) && (
        <div className="ed-bar">
          <span>{dirty ? "Alterações não salvas" : "Clique para selecionar · clique de novo para editar"}</span>
          <button onClick={undo} disabled={!history.length} title="Ctrl+Z">
            <Undo2 size={15} /> Desfazer
          </button>
          <button onClick={reset}>
            <RotateCcw size={15} /> Original
          </button>
          <button onClick={() => { setDraft(null); setHistory([]); }} disabled={!dirty}>
            <X size={15} /> Descartar
          </button>
          <button className="ed-save" onClick={save} disabled={!dirty || saving} title="Ctrl+S">
            <Save size={15} /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}

      {picker && (
        <MediaPicker
          onClose={() => setPicker(null)}
          onPick={(url, type: MediaType) => {
            const kind: Block["kind"] = type === "audio" ? "audio" : type === "video" ? "video" : "image";
            if (picker.mode === "replace") update(picker.id, { src: url, kind });
            else insertAfter(picker.id, mk({ kind, src: url, content: type === "audio" ? "Trilha Sonora" : "" }));
            setPicker(null);
          }}
        />
      )}

      {lightbox && (
        <div className="bk-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Arte ampliada" />
        </div>
      )}
    </div>
  );
}

function MangaAudioPlayer({ b, editing, onChange }: { b: Block; editing: boolean; onChange: (p: Partial<Block>) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isBgm = b.pos === "bgm";
  const vol = (b.zoom ?? 100) / 100;

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol]);

  const toggle = () => {
    if (!audioRef.current || !b.src) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const fmt = (s: number) => {
    if (isNaN(s)) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className={`mg-audio-wrap ${isBgm ? "is-bgm" : "is-voice"}`}>
      {b.src && (
        <audio
          ref={audioRef}
          src={b.src}
          loop={isBgm}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setPlaying(false)}
        />
      )}

      <div className="mg-audio-inner">
        <button type="button" className="mg-audio-play-btn" onClick={toggle} disabled={!b.src}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="mg-audio-info">
          <div className="mg-audio-header">
            <span className={`mg-audio-tag ${isBgm ? "tag-bgm" : "tag-voice"}`}>
              {isBgm ? "♫ TRILHA SONORA" : "✦ DUBLAGEM"}
            </span>
            <span className="mg-audio-title">{b.content || (isBgm ? "Música de fundo" : "Voz da cena")}</span>
            <span className="mg-audio-time">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>

          <div
            className="mg-audio-track"
            onClick={(e) => {
              if (!audioRef.current || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pct * duration;
            }}
          >
            <div className="mg-audio-fill" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {!b.src && editing && (
        <p style={{ color: "var(--arcane)", fontSize: "11px", textAlign: "center", margin: "6px 0 0" }}>
          Nenhum áudio selecionado. Clique no bloco e escolha "Trocar áudio" na barra.
        </p>
      )}
    </div>
  );
}

function BlockView({
  b,
  editing,
  selected,
  writing,
  over,
  onSelect,
  onOpen,
  onChange,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  b: Block;
  editing: boolean;
  selected: boolean;
  writing: boolean;
  over: boolean;
  onSelect: () => void;
  onOpen: (src: string) => void;
  onChange: (p: Partial<Block>) => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  const cls = `bk bk-${b.kind} bk-${b.align} bk-size-${b.size} bk-c-${b.color} bk-f-${b.font} bk-fr-${b.frame} ${
    selected ? "sel" : ""
  } ${over ? "drop" : ""}`;
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
          onDragOver();
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          onDrop();
        },
      }
    : {};

  const handles =
    editing && selected ? (
      <>
        <span
          className="ed-grip"
          draggable
          title="Arraste para mudar a posição"
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", b.id);
            onDragStart();
          }}
        >
          <GripVertical size={16} />
        </span>
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
      if (moved) onChange({ pos: `${Math.round(nx)}% ${Math.round(ny)}%` });
    };
    const ptr = editing ? { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp } : {};
    return (
      <figure ref={hostRef as React.RefObject<HTMLElement>} className={cls} style={style} onClick={onSelect} {...dnd}>
        {handles}
        <div className={`mg-panel bk-frame ${cropped ? "" : "bk-full"}`}>
          {b.kind === "video" ? (
            <video
              src={b.src ?? ""}
              autoPlay
              muted
              loop
              playsInline
              style={{ objectPosition: b.pos, cursor: selected ? "move" : undefined }}
              {...ptr}
            />
          ) : !cropped ? (
            <img
              src={b.src ?? ""}
              alt={b.content || "Arte de THE ELDER"}
              loading="lazy"
              draggable={false}
              onClick={() => onOpen(b.src ?? "")}
            />
          ) : (
            <div
              className="bk-crop"
              role="img"
              aria-label={b.content || "Recorte de arte"}
              style={{
                backgroundImage: `url(${b.src})`,
                backgroundPosition: b.pos,
                backgroundSize: `${b.zoom}%`,
                cursor: selected ? "move" : "zoom-in",
                touchAction: selected ? "none" : undefined,
              }}
              onClick={() => onOpen(b.src ?? "")}
              {...ptr}
            />
          )}
        </div>
        {(b.content || (editing && selected)) && (
          <figcaption
            className="mg-caption"
            contentEditable={writing}
            suppressContentEditableWarning
            onBlur={(e) => e.currentTarget.textContent !== b.content && onChange({ content: e.currentTarget.textContent ?? "" })}
          >
            {b.content}
          </figcaption>
        )}
      </figure>
    );
  }

  const Tag = b.kind === "quote" ? "blockquote" : "div";
  return (
    <Tag ref={hostRef as never} className={cls} style={style} onClick={onSelect} {...dnd}>
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
            title="Alternar entre Dublagem e Trilha"
            className="on"
            onClick={() => onChange({ pos: b.pos === "bgm" ? "voice" : "bgm" })}
          >
            {b.pos === "bgm" ? "♫ Mudar p/ Dublagem" : "✦ Mudar p/ Trilha"}
          </button>
          <label className="ed-zoom" title="Volume">
            <Volume2 size={14} />
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={b.zoom ?? 100}
              onChange={(e) => onChange({ zoom: Number(e.target.value) })}
            />
          </label>
        </>
      )}

      {!media && !isAudio && b.kind !== "divider" && (
        <>
          <button title="Negrito" className={b.bold ? "on" : ""} onClick={() => onChange({ bold: !b.bold })}>
            <Bold size={15} />
          </button>
          <button title="Itálico" className={b.italic ? "on" : ""} onClick={() => onChange({ italic: !b.italic })}>
            <Italic size={15} />
          </button>
          <button title="Tamanho" onClick={() => onChange({ size: next(sizes, b.size) })}>
            <Type size={15} /> {b.size.toUpperCase()}
          </button>
          <button title="Cor do texto" onClick={() => onChange({ color: next(colors, b.color) })}>
            <Palette size={15} />
            <span className={`ed-dot bk-c-${b.color}`} />
          </button>
          <button title="Fonte" onClick={() => onChange({ font: next(fonts, b.font) })}>
            Aa {label[b.font]}
          </button>
        </>
      )}

      {media && (
        <>
          <button title="Trocar mídia" onClick={onReplace}>
            <Replace size={15} />
          </button>
          {b.kind === "image" && (
            <label className="ed-zoom" title="Zoom (100 = imagem inteira)">
              <Move size={14} />
              <input
                type="range"
                min={100}
                max={500}
                step={10}
                value={b.zoom}
                onChange={(e) => onChange({ zoom: Number(e.target.value) })}
              />
            </label>
          )}
          <button title="Quadro" onClick={() => onChange({ frame: next(frames, b.frame) })}>
            <Square size={14} /> {label[b.frame]}
          </button>
        </>
      )}

      <i />
      <button title="Esquerda" className={b.align === "left" ? "on" : ""} onClick={() => onChange({ align: "left" })}>
        <AlignLeft size={15} />
      </button>
      <button title="Centro" className={b.align === "center" ? "on" : ""} onClick={() => onChange({ align: "center" })}>
        <AlignCenter size={15} />
      </button>
      <button title="Direita" className={b.align === "right" ? "on" : ""} onClick={() => onChange({ align: "right" })}>
        <AlignRight size={15} />
      </button>
      <label className="ed-zoom" title="Largura">
        <span>↔</span>
        <input
          type="range"
          min={25}
          max={100}
          step={5}
          value={b.width}
          onChange={(e) => onChange({ width: Number(e.target.value) })}
        />
      </label>

      <i />
      <button title="Subir" onClick={onUp}>
        <ArrowUp size={15} />
      </button>
      <button title="Descer" onClick={onDown}>
        <ArrowDown size={15} />
      </button>
      <button title="Duplicar" onClick={onDup}>
        <Copy size={15} />
      </button>
      <button title="Apagar (Delete)" onClick={onDel}>
        <Trash2 size={15} />
      </button>

      <i />
      <button title="Adicionar texto" onClick={() => onAdd("text")}>
        <Plus size={13} />
        <Type size={14} />
      </button>
      <button title="Adicionar imagem" onClick={onAddImage}>
        <ImagePlus size={15} />
      </button>
      <button title="Adicionar Áudio / Dublagem" onClick={onAddAudio}>
        <Headphones size={15} />
      </button>
      <button title="Adicionar balão de fala" onClick={() => onAdd("quote")}>
        <MessageCircle size={15} />
      </button>
      <button title="Adicionar onomatopeia" onClick={() => onAdd("sfx")}>
        <Zap size={15} />
      </button>
      <button title="Adicionar divisor" onClick={() => onAdd("divider")}>
        <Minus size={15} />
      </button>
    </div>
  );
}
