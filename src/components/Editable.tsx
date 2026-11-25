import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Replace } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MediaPicker } from "./MediaPicker";

type Slot = { content: string; src: string | null; pos: string; kind: string };

function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const { data } = await supabase.from("content_blocks").select("page,content,src,pos,kind").like("page", "slot-%");
      const out: Record<string, Slot> = {};
      (data ?? []).forEach((r) => { out[r.page.slice(5)] = { content: r.content, src: r.src, pos: r.pos, kind: r.kind }; });
      return out;
    },
  });
}

function useSaveSlot() {
  const qc = useQueryClient();
  return async (id: string, slot: Slot) => {
    const page = `slot-${id}`;
    const del = await supabase.from("content_blocks").delete().eq("page", page);
    const ins = del.error ? del : await supabase.from("content_blocks").insert({ page, position: 0, kind: slot.kind, content: slot.content, src: slot.src, pos: slot.pos });
    if (ins.error) { toast.error("Não foi possível salvar: " + ins.error.message); return; }
    await qc.invalidateQueries({ queryKey: ["slots"] });
    toast.success("Salvo para todos os leitores");
  };
}

/** Texto único editável com clique (somente administradores no modo edição). */
export function EText({ id, text, className, style }: { id: string; text: string; className?: string; style?: CSSProperties }) {
  const { editMode } = useAuth();
  const { data } = useSlots();
  const save = useSaveSlot();
  const cur = data?.[id];
  const value = cur?.content ?? text;
  if (!editMode) return <span className={className} style={{ whiteSpace: "pre-line", ...style }}>{value}</span>;
  return (
    <span className={`ed-slot ${className ?? ""}`} style={{ whiteSpace: "pre-line", ...style }} contentEditable suppressContentEditableWarning
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), (e.currentTarget as HTMLElement).blur())}
      onBlur={(e) => { const v = e.currentTarget.innerText; if (v !== value) save(id, { kind: "text", content: v, src: null, pos: "50% 50%" }); }}>
      {value}
    </span>
  );
}

/** Imagem/vídeo único editável: devolve src/pos atuais e um editor para colocar dentro de um elemento com position:relative. */
export function useEImg(id: string, src: string, pos = "50% 50%"): { src: string; pos: string; video: boolean; editor: ReactNode } {
  const { editMode } = useAuth();
  const { data } = useSlots();
  const save = useSaveSlot();
  const cur = data?.[id];
  const s = cur?.src ?? src;
  const p = cur?.pos ?? pos;
  const video = cur ? cur.kind === "video" : /\.(mp4|webm|mov)(\?|$)/i.test(src);
  return { src: s, pos: p, video, editor: editMode ? <ImgEditor key={id} pos={p} onSave={(np, ns, v) => save(id, { kind: v ?? video ? "video" : "image", content: "", src: ns ?? s, pos: np })} /> : null };
}

function ImgEditor({ pos, onSave }: { pos: string; onSave: (pos: string, src?: string, video?: boolean) => void }) {
  const [picker, setPicker] = useState(false);
  const d = useRef<{ x: number; y: number; px: number; py: number; nx: number; ny: number } | null>(null);
  const [live, setLive] = useState<string | null>(null);
  const [px, py] = pos.split(" ").map((v) => parseFloat(v));
  const stop = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
  return (
    <>
      <div className="ed-img-over" title="Arraste para posicionar a imagem"
        onClick={stop}
        onPointerDown={(e) => { stop(e); e.currentTarget.setPointerCapture(e.pointerId); d.current = { x: e.clientX, y: e.clientY, px: px ?? 50, py: py ?? 50, nx: px ?? 50, ny: py ?? 50 }; }}
        onPointerMove={(e) => { const r = d.current; if (!r) return; r.nx = Math.max(0, Math.min(100, r.px - (e.clientX - r.x) / 3)); r.ny = Math.max(0, Math.min(100, r.py - (e.clientY - r.y) / 3)); const v = `${Math.round(r.nx)}% ${Math.round(r.ny)}%`; setLive(v); const host = e.currentTarget.parentElement; if (host) { host.style.backgroundPosition = v; host.querySelectorAll<HTMLElement>("img,video").forEach((m) => (m.style.objectPosition = v)); } }}
        onPointerUp={() => { const r = d.current; d.current = null; setLive(null); if (r && (r.nx !== r.px || r.ny !== r.py)) onSave(`${Math.round(r.nx)}% ${Math.round(r.ny)}%`); }}>
        <button className="ed-img-btn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { stop(e); setPicker(true); }}><Replace size={14} /> Trocar</button>
        {live && <span className="ed-img-pos">{live}</span>}
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onPick={(url, v) => { setPicker(false); onSave(pos, url, v); }} />}
    </>
  );
}
