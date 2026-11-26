import { chapter } from "@/content/story";
import { media, sceneArt } from "@/content/media";
import type { Entry } from "@/content/characters";

export type BlockKind = "text" | "image" | "video" | "sfx" | "quote" | "divider";
export type Block = {
  id: string; kind: BlockKind; content: string; src: string | null;
  pos: string; zoom: number; align: "left" | "center" | "right";
  bold: boolean; italic: boolean; size: "sm" | "md" | "lg"; width: number;
  color: "default" | "blood" | "arcane" | "gold" | "paper"; font: "body" | "manga" | "title"; frame: "straight" | "slant" | "none";
};

let n = 0;
export const newId = () => `tmp-${Date.now().toString(36)}-${(n++).toString(36)}`;
export const mk = (p: Partial<Block> & { kind: BlockKind }): Block => ({
  id: newId(), content: "", src: null, pos: "50% 50%", zoom: 100, align: "left", bold: false, italic: false, size: "md", width: 100, color: "default", font: "body", frame: "straight", ...p,
});

const sfxList = ["ZAN!", "DOOM...", "KRAK!", "GRRRAAH!", "SLASH!", "THUD!", "SSSSS...", "VRUUM!", "..."];
const crops = [media.suzune, media.besta, media.reptil, media.pantera, media.mago, media.duo];

/** Cena do capítulo: arte, onomatopeia, parágrafos intercalados com recortes de fichas. Texto original intacto. */
export function sceneDefaults(i: number): Block[] {
  const s = chapter.sections[i];
  if (!s) return [];
  const art = sceneArt[i];
  const out: Block[] = [];
  if (art) out.push(mk({ kind: art.video ? "video" : "image", src: art.src, pos: art.pos ?? "50% 50%", zoom: art.zoom ? parseInt(art.zoom) : 100, align: "center", content: art.caption }));
  out.push(mk({ kind: "sfx", content: sfxList[i] ?? "...", align: i % 2 ? "left" : "right" }));
  const paras = s.text.split("\n\n");
  paras.forEach((p, k) => {
    out.push(mk({ kind: "text", content: p }));
    if (k % 2 === 1 && k < paras.length - 1) {
      const src = crops[(i + k) % crops.length]!;
      out.push(mk({ kind: "image", src, zoom: 240, pos: `${(k * 37) % 100}% ${(k * 53 + i * 11) % 100}%`, align: k % 4 === 1 ? "right" : "left", content: "" }));
    }
  });
  return out;
}

/** Ficha de personagem/besta: texto e recortes alternados. */
export function entryDefaults(e: Entry, extra?: string): Block[] {
  const sheet = e.sheets[0] ?? e.portrait;
  const out: Block[] = [
    mk({ kind: "text", content: e.summary, size: "lg" }),
    mk({ kind: "image", src: sheet, zoom: 260, pos: "20% 25%", align: "right", content: "Detalhe da ficha" }),
  ];
  if (extra) out.push(mk({ kind: "text", content: extra, bold: true }));
  e.facts.forEach((f, k) => {
    out.push(mk({ kind: "text", content: f }));
    if (k === 1) out.push(mk({ kind: "image", src: e.sheets[1] ?? sheet, zoom: 260, pos: "80% 30%", align: "left" }));
  });
  out.push(mk({ kind: "quote", content: e.quote, align: "center" }));
  out.push(mk({ kind: "image", src: sheet, zoom: 100, align: "center", content: "Ficha completa" }));
  return out;
}

export function worldDefaults(): Block[] {
  const items: [string, string, string][] = [
    ["Eras & História", "A Guerra Divina, a Era Perdida e os acontecimentos que moldaram o presente.", media.capa],
    ["Regiões & Masmorras", "Territórios conhecidos, labirintos recém-descobertos e lugares que não constam nos mapas.", media.reptil],
    ["Magia & Sistemas", "O desenvolvimento da magia, afinidades elementais e conhecimentos antigos.", media.mago],
    ["Raças & Povos", "Humanos, Elfos, Meio-humanos e outras raças que habitam este mundo.", media.duo],
  ];
  return items.flatMap(([t, d, src], k) => [
    mk({ kind: "image", src, zoom: k ? 220 : 100, pos: `${30 + k * 15}% ${20 + k * 15}%`, align: k % 2 ? "right" : "left", content: t }),
    mk({ kind: "text", content: t, size: "lg", bold: true }),
    mk({ kind: "text", content: d }),
  ]);
}
