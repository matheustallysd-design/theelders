import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { media } from "@/content/media";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File): Promise<string> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link");
  return data.signedUrl;
}

export async function listUploaded(): Promise<{ name: string; url: string; video: boolean }[]> {
  const { data } = await supabase.storage.from("media").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (!data?.length) return [];
  const names = data.filter((f) => f.name && !f.name.startsWith(".")).map((f) => f.name);
  const { data: signed } = await supabase.storage.from("media").createSignedUrls(names, TEN_YEARS);
  return (signed ?? []).filter((s) => s.signedUrl).map((s) => ({ name: s.path ?? "", url: s.signedUrl ?? "", video: /\.(mp4|webm|mov)$/i.test(s.path ?? "") }));
}

export const builtIn = Object.entries(media).map(([name, url]) => ({ name, url, video: name.startsWith("video") }));

export function MediaPicker({ onPick, onClose }: { onPick: (url: string, video: boolean) => void; onClose: () => void }) {
  const [items, setItems] = useState(builtIn);
  const [busy, setBusy] = useState(false);
  useEffect(() => { listUploaded().then((u) => setItems([...u, ...builtIn])); }, []);
  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { const url = await uploadMedia(f); onPick(url, f.type.startsWith("video")); toast.success("Mídia enviada"); }
    catch (e) { toast.error("Não foi possível enviar: " + (e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <div className="ed-modal" onClick={onClose}>
      <div className="ed-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ed-modal-head"><b>Escolher imagem ou vídeo</b><button onClick={onClose} aria-label="Fechar"><X size={18} /></button></div>
        <label className="ed-upload"><Upload size={16} /> {busy ? "Enviando..." : "Enviar do computador"}
          <input type="file" accept="image/*,video/*" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
        <div className="ed-grid">
          {items.map((m) => (
            <button key={m.url} className="ed-thumb" onClick={() => onPick(m.url, m.video)} title={m.name}>
              {m.video ? <video src={m.url} muted /> : <img src={m.url} alt={m.name} loading="lazy" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
