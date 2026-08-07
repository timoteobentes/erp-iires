export interface CreateChargeInput {
  organizationId: string;
  invoiceId: string;
  /** Valor em reais (ex: 149.90) — o adapter converte para a unidade que o gateway espera. */
  amount: number;
  description: string;
  payer: { name: string; email: string; document?: string | null };
}

export interface CreateChargeResult {
  /** Identificador que usamos para reconsultar essa cobrança depois (nosso, não do gateway). */
  externalId: string;
  checkoutUrl: string;
}

export interface ChargeStatus {
  status: 'PENDING' | 'PAID' | 'CANCELED';
  paidAmount?: number | undefined;
  paidAt?: Date | undefined;
}

export interface NormalizedWebhookEvent {
  /** Mesmo valor que devolvemos em createCharge().externalId — usado para achar a Invoice. */
  externalId: string;
  transactionNsu?: string;
  paidAmount: number;
  raw: unknown;
}

/**
 * Abstração sobre o meio de pagamento — a InfinitePay é o primeiro adapter,
 * mas o motor de cobrança (Billing module) nunca fala com ela diretamente.
 * Ver docs/BILLING.md §2.
 */
export interface PaymentGateway {
  readonly name: string;
  createCharge(input: CreateChargeInput): Promise<CreateChargeResult>;
  getCharge(externalId: string): Promise<ChargeStatus>;
  /** Valida a origem (token) e normaliza o payload recebido no webhook. Retorna null se inválido. */
  parseWebhook(body: unknown, token: string | undefined): NormalizedWebhookEvent | null;
}
