import { describe, it, expect } from "vitest";
import { mk } from "@/lib/blocks";
import { blockToRow, rowToBlock } from "@/lib/blockRows";

describe("blocos ⇄ linhas do banco", () => {
  it("guarda e recupera um bloco de dublagem sem perder dados", () => {
    const b = mk({ kind: "audio", src: "x.mp3", audioMode: "voice", label: "Cena 1", volume: 0.5 });
    const back = rowToBlock({ ...blockToRow(b, "cap01-s0", 3), id: b.id });
    expect(back).toEqual(b);
  });
  it("salva a ordem pela posição", () => {
    expect(blockToRow(mk({ kind: "text" }), "p", 7).position).toBe(7);
  });
});
