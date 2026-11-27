import type { CSSProperties } from "react";

export type SlotStyle = {
  size?: "sm" | "md" | "lg" | "xl";
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  font?: "" | "manga" | "title" | "body";
  lh?: number;
  glow?: boolean;
  zoom?: number;
  rotate?: number;
  radius?: number;
  filter?: string;
};

export const SIZE_EM = { sm: 0.8, md: 1, lg: 1.3, xl: 1.7 } as const;
export const FILTERS: [string, string][] = [["", "Normal"], ["grayscale(1)", "P&B"], ["sepia(.8)", "Sépia"], ["brightness(.6)", "Escuro"], ["contrast(1.4)", "Contraste"]];
const FONT_FAM = { manga: "'Bangers', cursive", title: "'Cinzel', serif", body: "inherit" } as const;

export function slotTextCss(s: SlotStyle): CSSProperties {
  const c: CSSProperties = {};
  if (s.size) c.fontSize = `${SIZE_EM[s.size]}em`;
  if (s.bold) c.fontWeight = 800;
  if (s.italic) c.fontStyle = "italic";
  if (s.align) { c.textAlign = s.align; c.display = "block"; }
  if (s.color) c.color = s.color;
  if (s.font) c.fontFamily = FONT_FAM[s.font];
  if (s.lh) c.lineHeight = s.lh;
  if (s.glow) c.textShadow = `0 0 12px ${s.color ?? "currentColor"}`;
  return c;
}

export function slotImgCss(s: SlotStyle): CSSProperties {
  const c: CSSProperties = {};
  if (s.filter) c.filter = s.filter;
  if (s.radius) c.borderRadius = s.radius;
  if (s.rotate) c.transform = `rotate(${s.rotate}deg)`;
  return c;
}
