import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  userId: string;
  organizationId: string;
  membershipId: string;
  isOwner: boolean;
  permissions: string[];
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Roda `fn` com o contexto de tenant disponível para toda a árvore assíncrona chamada por dentro. */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** Lê o contexto atual. Lança erro se chamado fora de uma requisição autenticada. */
export function getContext(): RequestContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error('Contexto de tenant indisponível: nenhuma requisição autenticada em andamento.');
  }
  return ctx;
}

/** Lê o contexto atual sem lançar erro — usa fora do fluxo de requisição (ex.: auditoria best-effort). */
export function tryGetContext(): RequestContext | undefined {
  return storage.getStore();
}
