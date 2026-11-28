import type { Block } from "./blocks";

/** Linha da tabela content_blocks (um registro por bloco). */
export type BlockRow = {
  id?: string; page: string; position: number; kind: string; content: string; src: string | null;
  pos: string; zoom: number; align: string; bold: boolean; italic: boolean; size: string;
  width: number; color: string; font: string; frame: string; style: unknown;
};

type Extra = Pick<Block, "caption" | "audioMode" | "label" | "volume">;

export function blockToRow(b: Block, page: string, position: number): BlockRow {
  const extra: Extra = {};
  if (b.caption !== undefined) extra.caption = b.caption;
  if (b.audioMode !== undefined) extra.audioMode = b.audioMode;
  if (b.label !== undefined) extra.label = b.label;
  if (b.volume !== undefined) extra.volume = b.volume;
  return {
    page, position, kind: b.kind, content: b.content ?? "", src: b.src, pos: b.pos,
    zoom: Math.round(b.zoom), align: b.align, bold: b.bold, italic: b.italic, size: b.size,
    width: Math.round(b.width), color: b.color, font: b.font, frame: b.frame, style: extra,
  };
}

export function rowToBlock(r: BlockRow): Block {
  const st = (r.style && typeof r.style === "object" ? r.style : {}) as Extra;
  return {
    id: r.id ?? `row-${r.position}`, kind: r.kind as Block["kind"], content: r.content, src: r.src,
    pos: r.pos, zoom: r.zoom, align: r.align as Block["align"], bold: r.bold, italic: r.italic,
    size: r.size as Block["size"], width: r.width, color: r.color as Block["color"],
    font: r.font as Block["font"], frame: r.frame as Block["frame"],
    ...(st.caption !== undefined && { caption: st.caption }),
    ...(st.audioMode !== undefined && { audioMode: st.audioMode }),
    ...(st.label !== undefined && { label: st.label }),
    ...(st.volume !== undefined && { volume: st.volume }),
  };
}
