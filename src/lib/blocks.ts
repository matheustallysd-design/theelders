
import { chapter } from "@/content/story";
import { media, sceneArt } from "@/content/media";
import type { Entry } from "@/content/characters";

export type BlockKind =
  | "text"
  | "image"
  | "video"
  | "sfx"
  | "quote"
  | "divider"
  | "audio";

export type Block = {
  id: string;
  kind: BlockKind;
  content: string;
  src: string | null;
  pos: string;
  zoom: number;
  align: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  size: "sm" | "md" | "lg";
  width: number;
  color: "default" | "blood" | "arcane" | "gold" | "paper";
  font: "body" | "manga" | "title";
  frame: "straight" | "slant" | "none";
  caption?: string;
  audioMode?: "bgm" | "voice";
  label?: string;
  volume?: number;
};

// =====================================================
// IDENTIFICADORES
// =====================================================

let n = 0;

export const newId = (): string =>
  `tmp-${Date.now().toString(36)}-${(n++).toString(36)}`;

// =====================================================
// CRIAÇÃO DE BLOCOS
// =====================================================

export const mk = (
  p: Partial<Block> & { kind: BlockKind }
): Block => ({
  id: newId(),
  kind: p.kind,
  content: "",
  src: null,
  pos: p.kind === "audio" ? "voice" : "50% 50%",
  zoom: 100,
  align: "left",
  bold: false,
  italic: false,
  size: "md",
  width: 100,
  color: "default",
  font: "body",
  frame: "straight",
  audioMode: p.kind === "audio" ? "voice" : undefined,
  volume: 0.8,
  ...p,
});

// =====================================================
// CONFIGURAÇÕES DE CENAS
// =====================================================

const sfxList = [
  "ZAN!",
  "DOOM...",
  "KRAK!",
  "GRRRAAH!",
  "SLASH!",
  "THUD!",
  "SSSSS...",
  "VRUUM!",
  "...",
];

const crops = [
  media.suzune,
  media.besta,
  media.reptil,
  media.pantera,
  media.mago,
  media.duo,
].filter((src): src is string => typeof src === "string" && src.length > 0);

// =====================================================
// GERAÇÃO DAS CENAS DO CAPÍTULO
// =====================================================

export function sceneDefaults(i: number): Block[] {
  if (!Number.isInteger(i) || i < 0) return [];

  const s = chapter?.sections?.[i];

  if (!s || typeof s.text !== "string") return [];

  const art = sceneArt?.[i];

  const out: Block[] = [];

  // Arte principal da cena
  if (art && typeof art.src === "string" && art.src.length > 0) {
    const parsedZoom = Number(art.zoom);

    out.push(
      mk({
        kind: art.video ? "video" : "image",
        src: art.src,
        pos: art.pos || "50% 50%",
        zoom: Number.isFinite(parsedZoom) && parsedZoom > 0
          ? parsedZoom
          : 100,
        align: "center",
        content: art.caption ?? "",
      })
    );
  }

  // Efeitos sonoros
  out.push(
    mk({
      kind: "sfx",
      content: sfxList[i] ?? "...",
      align: i % 2 === 0 ? "right" : "left",
    })
  );

  // Parágrafos da narrativa
  const paras = s.text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  paras.forEach((p, k) => {
    out.push(
      mk({
        kind: "text",
        content: p,
      })
    );

    // Imagens intercaladas com os textos
    if (
      k % 2 === 1 &&
      k < paras.length - 1 &&
      crops.length > 0
    ) {
      const src = crops[(i + k) % crops.length];

      if (src) {
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
    }
  });

  return out;
}

// =====================================================
// GERAÇÃO DAS FICHAS DE PERSONAGENS E CRIATURAS
// =====================================================

export function entryDefaults(
  e: Entry,
  extra?: string
): Block[] {
  if (!e) return [];

  const sheets = e.sheets ?? [];
  const sheet = sheets[0] ?? e.portrait ?? null;

  const out: Block[] = [];

  // Resumo do personagem
  out.push(
    mk({
      kind: "text",
      content: e.summary ?? "",
      size: "lg",
    })
  );

  // Imagem principal
  if (sheet) {
    out.push(
      mk({
        kind: "image",
        src: sheet,
        zoom: 260,
        pos: "20% 25%",
        align: "right",
        content: "Detalhe da ficha",
      })
    );
  }

  // Texto adicional
  if (extra && extra.trim()) {
    out.push(
      mk({
        kind: "text",
        content: extra,
        bold: true,
      })
    );
  }

  // Informações e características
  const facts = e.facts ?? [];

  facts.forEach((f, k) => {
    if (typeof f !== "string" || !f.trim()) return;

    out.push(
      mk({
        kind: "text",
        content: f,
      })
    );

    // Segunda imagem da ficha
    if (k === 1) {
      const secondSheet = sheets[1] ?? sheet;

      if (secondSheet) {
        out.push(
          mk({
            kind: "image",
            src: secondSheet,
            zoom: 260,
            pos: "80% 30%",
            align: "left",
          })
        );
      }
    }
  });

  // Frase de destaque
  if (e.quote) {
    out.push(
      mk({
        kind: "quote",
        content: e.quote,
        align: "center",
      })
    );
  }

  // Ficha completa
  if (sheet) {
    out.push(
      mk({
        kind: "image",
        src: sheet,
        zoom: 100,
        align: "center",
        content: "Ficha completa",
      })
    );
  }

  return out;
}

// =====================================================
// ARQUIVO DO MUNDO
// =====================================================

export function worldDefaults(): Block[] {
  const items: [string, string, string | null][] = [
    [
      "Eras & História",
      "A Guerra Divina, a Era Perdida e os acontecimentos que moldaram o presente.",
      media.capa,
    ],
    [
      "Regiões & Masmorras",
      "Territórios conhecidos, labirintos recém-descobertos e lugares que não constam nos mapas.",
      media.reptil,
    ],
    [
      "Magia & Sistemas",
      "O desenvolvimento da magia, afinidades elementais e conhecimentos antigos.",
      media.mago,
    ],
    [
      "Raças & Povos",
      "Humanos, Elfos, Meio-humanos e outras raças que habitam este mundo.",
      media.duo,
    ],
  ];

  return items.flatMap(([title, description, src], k) => {
    const blocks: Block[] = [];

    // Imagem da categoria
    if (src) {
      blocks.push(
        mk({
          kind: "image",
          src,
          zoom: k === 0 ? 100 : 220,
          pos: `${30 + k * 15}% ${20 + k * 15}%`,
          align: k % 2 === 0 ? "left" : "right",
          content: title,
        })
      );
    }

    // Título
    blocks.push(
      mk({
        kind: "text",
        content: title,
        size: "lg",
        bold: true,
      })
    );

    // Descrição
    blocks.push(
      mk({
        kind: "text",
        content: description,
      })
    );

    return blocks;
  });
}
