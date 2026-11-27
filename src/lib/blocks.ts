import { chapter } from "@/content/story";
import { media, sceneArt } from "@/content/media";

export type BlockKind = "text" | "image" | "video" | "sfx" | "quote" | "divider" | "audio";

export type Block = {
  id: string;
  kind: BlockKind;
  content: string;
  src: string | null;
  pos: string; // Para áudio: "voice" (Dublagem) ou "bgm" (Trilha Sonora)
  zoom: number; // Para áudio: Volume de 0 a 100
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  size: "sm" | "md" | "lg";
  width: number;
  color: "default" | "blood" | "arcane" | "gold" | "paper";
  font: "body" | "manga" | "title";
  frame: "straight" | "slant" | "none";
};

let n = 0;
export const newId = () => `tmp-${Date.now().toString(36)}-${(n++).toString(36)}`;

export const mk = (p: Partial<Block> & { kind: BlockKind }): Block => ({
  id: newId(),
  content: "",
  src: null,
  pos: p.kind === "audio" ? "voice" : "50% 50%",
  zoom: p.kind === "audio" ? 100 : 100,
  align: "left",
  bold: false,
  italic: false,
  size: "md",
  width: 100,
  color: "default",
  font: "body",
  frame: "straight",
  ...p,
});

const sfxList = ["ZAN!", "DOOM...", "KRAK!", "GRRRAAH!", "SLASH!", "THUD!", "SSSSS...", "VRUUM!", "..."];
const crops = [media.suzune, media.besta, media.reptil, media.pantera, media.mago, media.duo];

/** Cena do capítulo: arte, onomatopeia, parágrafos intercalados com recortes de fichas. */
export function sceneDefaults(i: number): Block[] {
  const s = chapter.sections[i];
  if (!s) return [];
  const art = sceneArt[i];
  const out: Block[] = [];
  if (art) {
    out.push(
      mk({
        kind: art.video ? "video" : "image",
        src: art.src,
        pos: art.pos ?? "50% 50%",
        zoom: art.zoom ? parseInt(art.zoom) : 100,
        align: "center",
        content: art.caption,
      })
    );
  }
  out.push(mk({ kind: "sfx", content: sfxList[i] ?? "...", align: i % 2 ? "left" : "right" }));
  const paras = s.text.split("\n\n");
  paras.forEach((p, k) => {
    out.push(mk({ kind: "text", content: p }));
    if (k % 2 === 1 && k < paras.length - 1) {
      const src = crops[(i + k) % crops.length]!;
      out.push(
        mk({
          kind: "image",
          src,
          zoom: 240,
          pos: `${(k * 37) % 100}% ${(k * 53 + i * 11) % 100}%`,
          align: k % 4 === 1 ? "right" : "left",
          content: "",
        })
      );
    }
  });
  return out;
}
