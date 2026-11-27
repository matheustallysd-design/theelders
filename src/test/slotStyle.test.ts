import { describe, it, expect } from "vitest";
import { slotTextCss, slotImgCss } from "@/lib/slotStyle";

describe("estilos de edição", () => {
  it("tamanho GG aumenta o texto 1,7x", () => expect(slotTextCss({ size: "xl" }).fontSize).toBe("1.7em"));
  it("sem estilo não altera nada", () => expect(slotTextCss({})).toEqual({}));
  it("filtro P&B e giro aplicados à imagem", () => expect(slotImgCss({ filter: "grayscale(1)", rotate: 3 })).toEqual({ filter: "grayscale(1)", transform: "rotate(3deg)" }));
});
