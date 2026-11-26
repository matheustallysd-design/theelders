/** Números de página a mostrar: sempre a primeira, a última e vizinhas da atual; "…" nos saltos. */
export function pageNumbers(current: number, total: number, around = 1): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || Math.abs(i - current) <= around) out.push(i);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}
export const pageSlice = <T,>(items: T[], page: number, per: number) => items.slice(page * per, page * per + per);
export const pageCount = (n: number, per: number) => Math.max(1, Math.ceil(n / per));
