/**
 * Normalise page/pageSize fournis par un appelant (souvent dérivés de
 * paramètres d'URL non fiables) vers des valeurs sûres (§50 — pagination).
 * Empêche notamment ?pageSize=999999999 ou des valeurs NaN/négatives de
 * se propager jusqu'à une requête Prisma `skip`/`take`.
 */
export function clampPagination(
  input: { page?: number; pageSize?: number },
  options: { maxPageSize?: number; defaultPageSize?: number } = {}
): { page: number; pageSize: number } {
  const maxPageSize = options.maxPageSize ?? 50;
  const defaultPageSize = options.defaultPageSize ?? 12;

  const page = Math.max(1, Math.trunc(input.page ?? 1) || 1);
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, Math.trunc(input.pageSize ?? defaultPageSize) || defaultPageSize)
  );

  return { page, pageSize };
}
