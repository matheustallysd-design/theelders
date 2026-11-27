
import { useEffect, useState } from "react";
import { Upload, X, Headphones } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { media } from "@/content/media";

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const BUCKET = "media";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const PAGE_SIZE = 200;

export type MediaType = "image" | "video" | "audio";

export type MediaItem = {
  name: string;
  url: string;
  type: MediaType;
  video: boolean;
};

// =====================================================
// IDENTIFICAÇÃO DOS ARQUIVOS
// =====================================================

function getMediaType(file: {
  name: string;
  type?: string;
}): MediaType {
  const name = file.name.toLowerCase();
  const mime = file.type?.toLowerCase() ?? "";

  if (
    mime.startsWith("audio/") ||
    /\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(name)
  ) {
    return "audio";
  }

  if (
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|avi)$/i.test(name)
  ) {
    return "video";
  }

  return "image";
}

// =====================================================
// VALIDAÇÃO DOS ARQUIVOS
// =====================================================

function validateFile(file: File): void {
  if (!file || file.size <= 0) {
    throw new Error("O arquivo está vazio ou é inválido.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("O arquivo ultrapassa o limite de 100 MB.");
  }

  const type = getMediaType(file);

  const validExtensions = {
    image: /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)$/i,
    video: /\.(mp4|webm|mov|mkv|avi)$/i,
    audio: /\.(mp3|wav|m4a|ogg|aac|flac)$/i,
  };

  if (!validExtensions[type].test(file.name)) {
    throw new Error("Formato de arquivo não permitido.");
  }
}

// =====================================================
// UPLOAD DE MÍDIA
// =====================================================

export async function uploadMedia(
  file: File
): Promise<{ url: string; type: MediaType; video: boolean }> {
  validateFile(file);

  const extension = file.name.split(".").pop() ?? "file";

  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80);

  const path = `${Date.now()}-${safeName}.${extension.toLowerCase()}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // URL pública: requer que o bucket esteja configurado
  // como público no Supabase.
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Não foi possível gerar o endereço da mídia.");
  }

  const type = getMediaType(file);

  return {
    url: data.publicUrl,
    type,
    video: type === "video",
  };
}

// =====================================================
// LISTAGEM DAS MÍDIAS ENVIADAS
// =====================================================

export async function listUploaded(): Promise<MediaItem[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", {
      limit: PAGE_SIZE,
      sortBy: {
        column: "created_at",
        order: "desc",
      },
    });

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return [];
  }

  const files = data.filter(
    (file) =>
      file.name &&
      !file.name.startsWith(".") &&
      !file.name.endsWith("/")
  );

  return files
    .map((file) => {
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(file.name);

      const type = getMediaType({
        name: file.name,
      });

      return {
        name: file.name,
        url: publicData.publicUrl,
        type,
        video: type === "video",
      };
    })
    .filter((item) => Boolean(item.url));
}

// =====================================================
// MÍDIAS INTERNAS DO PROJETO
// =====================================================

export const builtIn: MediaItem[] = Object.entries(media)
  .filter(
    ([, url]) =>
      typeof url === "string" && url.length > 0
  )
  .map(([name, url]) => {
    const type = name.toLowerCase().startsWith("video")
      ? "video"
      : getMediaType({ name });

    return {
      name,
      url: url as string,
      type,
      video: type === "video",
    };
  });

// =====================================================
// COMPONENTE DE SELEÇÃO DE MÍDIA
// =====================================================

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
  const [items, setItems] = useState<MediaItem[]>(builtIn);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // CARREGAMENTO DAS MÍDIAS
  // ===================================================

  useEffect(() => {
    let active = true;

    async function loadMedia() {
      try {
        const uploaded = await listUploaded();

        if (active) {
          // Remove duplicidades por endereço.
          const unique = new Map<string, MediaItem>();

          [...uploaded, ...builtIn].forEach((item) => {
            if (item.url && !unique.has(item.url)) {
              unique.set(item.url, item);
            }
          });

          setItems(Array.from(unique.values()));
        }
      } catch (error) {
        console.error("Erro ao carregar mídias:", error);

        if (active) {
          setItems(builtIn);
          toast.error("Não foi possível carregar todas as mídias.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMedia();

    return () => {
      active = false;
    };
  }, []);

  // ===================================================
  // SELEÇÃO DE MÍDIA
  // ===================================================

  const handlePick = (
    url: string,
    mediaType: MediaType,
    name?: string
  ) => {
    if (!url) {
      toast.error("Endereço de mídia inválido.");
      return;
    }

    if (onSelect) {
      onSelect(url, mediaType, name);
    }

    if (onPick) {
      onPick(url, mediaType);
    }
  };

  // ===================================================
  // ENVIO DE ARQUIVOS
  // ===================================================

  const onFile = async (file?: File) => {
    if (!file || busy) return;

    setBusy(true);

    try {
      const result = await uploadMedia(file);

      const newItem: MediaItem = {
        name: file.name,
        url: result.url,
        type: result.type,
        video: result.video,
      };

      setItems((previous) => {
        const filtered = previous.filter(
          (item) => item.url !== newItem.url
        );

        return [newItem, ...filtered];
      });

      handlePick(result.url, result.type, file.name);

      toast.success(
        result.type === "audio"
          ? "Áudio enviado com sucesso!"
          : result.type === "video"
            ? "Vídeo enviado com sucesso!"
            : "Imagem enviada com sucesso!"
      );
    } catch (error) {
      console.error("Erro no upload:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido.";

      toast.error("Não foi possível enviar: " + message);
    } finally {
      setBusy(false);
    }
  };

  // ===================================================
  // FILTRAGEM
  // ===================================================

  const filteredItems = items.filter((item) => {
    switch (type) {
      case "audio":
        return item.type === "audio";

      case "image":
        return item.type === "image";

      case "video":
        return item.type === "video";

      case "visual":
        return item.type === "image" || item.type === "video";

      default:
        return false;
    }
  });

  // ===================================================
  // INTERFACE
  // ===================================================

  return (
    <div
      className="ed-modal"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ed-modal-box"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Seletor de mídias"
      >
        {/* CABEÇALHO */}

        <div className="ed-modal-head">
          <b>
            {type === "audio"
              ? "Escolher áudio ou dublagem"
              : type === "image"
                ? "Escolher imagem"
                : type === "video"
                  ? "Escolher vídeo"
                  : "Escolher imagem ou vídeo"}
          </b>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* UPLOAD */}

        <label className="ed-upload">
          <Upload size={16} />

          {busy
            ? "Enviando arquivo..."
            : "Enviar do computador"}

          <input
            type="file"
            accept={
              type === "audio"
                ? "audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac"
                : type === "image"
                  ? "image/*"
                  : type === "video"
                    ? "video/*"
                    : "image/*,video/*"
            }
            hidden
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];

              void onFile(file);

              // Permite selecionar novamente o mesmo arquivo.
              event.target.value = "";
            }}
          />
        </label>

        {/* GALERIA */}

        <div className="ed-grid">
          {loading ? (
            <p>Carregando mídias...</p>
          ) : filteredItems.length === 0 ? (
            <p>Nenhuma mídia encontrada.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                type="button"
                key={item.url}
                className="ed-thumb"
                onClick={() =>
                  handlePick(item.url, item.type, item.name)
                }
                title={item.name}
                aria-label={`Selecionar ${item.name}`}
              >
                {item.type === "video" ? (
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : item.type === "audio" ? (
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "100%",
                      background: "#17151f",
                      color: "var(--gold)",
                      overflow: "hidden",
                    }}
                  >
                    <Headphones size={28} />

                    <span
                      style={{
                        fontSize: "10px",
                        marginTop: "4px",
                        padding: "0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
