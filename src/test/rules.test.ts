import { describe, expect, it } from "vitest";
import { validateReview, average } from "@/lib/reviews";
import { pageNumbers } from "@/lib/pagination";

describe("avaliações", () => {
  it("aceita só notas de 1 a 5", () => {
    expect(validateReview(0, "")).not.toBeNull();
    expect(validateReview(6, "")).not.toBeNull();
    expect(validateReview(1, "")).toBeNull();
    expect(validateReview(5, "ótimo")).toBeNull();
  });
  it("limita comentário a 1000 caracteres", () => {
    expect(validateReview(4, "a".repeat(1001))).not.toBeNull();
    expect(validateReview(4, "a".repeat(1000))).toBeNull();
  });
  it("média com uma casa", () => { expect(average([5, 4, 4])).toBe(4.3); });
});
describe("rodapé numerado", () => {
  it("mostra todas as 9 cenas", () => { expect(pageNumbers(0, 9, 9)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]); });
  it("encurta com reticências", () => { expect(pageNumbers(5, 20, 1)).toEqual([0, "…", 4, 5, 6, "…", 19]); });
});
