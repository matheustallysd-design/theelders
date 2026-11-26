export const MAX_COMMENT = 1000;
/** Valida uma avaliação antes de enviar: nota inteira de 1 a 5 e comentário até 1000 caracteres. */
export function validateReview(rating: number, comment: string): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "Escolha uma nota de 1 a 5 estrelas.";
  if (comment.trim().length > MAX_COMMENT) return `O comentário pode ter até ${MAX_COMMENT} caracteres.`;
  return null;
}
export function average(ratings: number[]): number {
  if (!ratings.length) return 0;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}
