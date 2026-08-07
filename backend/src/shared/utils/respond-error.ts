import type { Response } from 'express';
import { NotFoundError } from '../../core/errors/not-found.error.js';

/** Traduz um erro capturado em controller para a resposta HTTP correta. */
export function respondError(res: Response, error: unknown, fallbackMessage: string): void {
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }
  console.error(fallbackMessage, error);
  res.status(500).json({ error: fallbackMessage });
}
