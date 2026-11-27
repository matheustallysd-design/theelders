import { useEffect, useState } from "react";
import { Upload, X, Headphones } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { media } from "@/content/media";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type MediaType = "image" | "video" | "audio";

export async function uploadMedia(file: File): Promise<{ url: string; type: MediaType; video: boolean }> {
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link");
  const isAud = file.type.startsWith("audio") || /\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name);
  const isVid = file.type.startsWith("video") || /\.(mp4|webm|mov)$/i.test(file.name);
  const type: MediaType = isAud ? "audio" : isVid ? "video" : "image";
  return { url: data.signedUrl, type, video: isVid };
}

export async function listUploaded(): Promise<{ name: string; url: string; type: MediaType; video: boolean }[]> {
  const { data } = await supabase.storage.from("media").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (!data?.length) return [];
  const names = data.filter((f) => f.name && !f.name.startsWith(".")).map((f) => f.name);
  const { data: signed } = await supabase.storage.from("media").createSignedUrls(names, TEN_YEARS);
  return (signed ?? [])
    .filter((s) => s.signedUrl)
    .map((s) => {
      const name = s.path ?? "";
      const isAud = /\.(mp3|wav|m4a|ogg|aac)$/i.test(name);
      const isVid = /\.(mp4|webm|mov)$/i.test(name);
      return {
        name,
        url: s.signedUrl ?? "",
        type: isAud ? "audio" : isVid ? "video" : "image",
        video: isVid,
      };
    });
}

export const builtIn = Object.entries(media).map(([name, url]) => {
  const isVid = name.startsWith("video");
  return {
    name,
    url,
    type: (isVid ? "video" : "image") as MediaType,
    video: isVid,
  };
});

export function MediaPicker({
  type = "visual",
  onSelect,
  onPick,
  onClose,
}: {
  type?: "visual" | "audio" | "image" | "video";
  onSelect?: (url: string, kind: string, label?: string) => void;
  onPick?: (url: string, type: MediaType) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<{ name: string; url: string; type: MediaType; video: boolean }[]>(builtIn);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listUploaded().then((u) => setItems([...u, ...builtIn]));
  }, []);

  const handlePick = (url: string, mediaType: MediaType, name?: string) => {
    if (onSelect) {
      onSelect(url, mediaType, name);
    }
    if (onPick) {
      onPick(url, mediaType);
    }
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      const res = await uploadMedia(f);
      handlePick(res.url, res.type, f.name);
      toast.success(res.type === "audio" ? "Áudio enviado com sucesso!" : "Mídia enviada");
    } catch (e) {
      toast.error("Não foi possível enviar: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const filteredItems = items.filter((m) => {
    if (type === "audio") return m.type === "audio";
    if (type === "visual") return m.type === "image" || m.type === "video";
    return true;
  });

  return (
    <div className="ed-modal" onClick={onClose}>
      <div className="ed-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ed-modal-head">
          <b>{type === "audio" ? "Escolher áudio ou dublagem" : "Escolher imagem ou vídeo"}</b>
          <button onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <label className="ed-upload">
          <Upload size={16} /> {busy ? "Enviando arquivo..." : "Enviar do computador"}
          <input
            type="file"
            accept={type === "audio" ? "audio/*,.mp3,.wav,.m4a,.ogg" : "image/*,video/*"}
            hidden
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>

        <div className="ed-grid">
          {filteredItems.map((m) => (
            <button
              key={m.url}
              className="ed-thumb"
              onClick={() => handlePick(m.url, m.type, m.name)}
              title={m.name}
            >
              {m.type === "video" ? (
                <video src={m.url} muted />
              ) : m.type === "audio" ? (
                <div style={{ display: "grid", placeItems: "center", height: "100%", background: "#17151f", color: "var(--gold)" }}>
                  <Headphones size={28} />
                  <span style={{ fontSize: "10px", marginTop: "4px", padding: "0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    {m.name}
                  </span>
                </div>
              ) : (
                <img src={m.url} alt={m.name} loading="lazy" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
