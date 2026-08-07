/**
 * Lançado quando um registro não existe OU pertence a outra organização.
 * Por design (ADR-001) a resposta HTTP é sempre 404 nos dois casos —
 * nunca 403 — para não revelar a um tenant que um recurso de outro existe.
 */
export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} não encontrado.`);
    this.name = 'NotFoundError';
  }
}
