import crypto from 'crypto';
import type {
  PaymentGateway, CreateChargeInput, CreateChargeResult, ChargeStatus, NormalizedWebhookEvent,
} from '../gateway.interface.js';

// Documentação pública: https://www.infinitepay.io/checkout-documentacao
// A InfinitePay não tem API de assinatura — só Checkout Integrado (cobrança avulsa).
// Ver docs/BILLING.md para o motivo dessa escolha e suas implicações.
const LINKS_URL = 'https://api.checkout.infinitepay.io/links';
const PAYMENT_CHECK_URL = 'https://api.checkout.infinitepay.io/payment_check';

function centavos(amountReais: number): number {
  return Math.round(amountReais * 100);
}

export class InfinitePayGateway implements PaymentGateway {
  readonly name = 'infinitepay';

  private get handle(): string {
    const handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) throw new Error('INFINITEPAY_HANDLE não configurado.');
    return handle;
  }

  private get webhookToken(): string {
    const token = process.env.INFINITEPAY_WEBHOOK_TOKEN;
    if (!token) throw new Error('INFINITEPAY_WEBHOOK_TOKEN não configurado.');
    return token;
  }

  async createCharge(input: CreateChargeInput): Promise<CreateChargeResult> {
    const backendUrl = process.env.BACKEND_PUBLIC_URL;
    if (!backendUrl) throw new Error('BACKEND_PUBLIC_URL não configurado (necessário para o webhook_url).');

    // order_nsu é o identificador que nós controlamos e usamos depois para
    // achar a Invoice de volta — usamos o próprio id da fatura.
    const orderNsu = input.invoiceId;

    const response = await fetch(LINKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: this.handle,
        order_nsu: orderNsu,
        redirect_url: `${process.env.FRONTEND_URL}/settings/billing?invoice=${input.invoiceId}`,
        webhook_url: `${backendUrl}/api/webhooks/infinitepay?token=${this.webhookToken}`,
        items: [{ quantity: 1, price: centavos(input.amount), description: input.description }],
        customer: { name: input.payer.name, email: input.payer.email },
      }),
    });

    if (!response.ok) {
      throw new Error(`InfinitePay /links respondeu ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as Record<string, any>;
    const checkoutUrl = data.url ?? data.checkout_url ?? data.link;
    if (!checkoutUrl) {
      throw new Error('InfinitePay /links não retornou uma URL de checkout reconhecível.');
    }

    return { externalId: orderNsu, checkoutUrl };
  }

  async getCharge(externalId: string): Promise<ChargeStatus> {
    const response = await fetch(PAYMENT_CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: this.handle, order_nsu: externalId }),
    });

    if (!response.ok) {
      throw new Error(`InfinitePay /payment_check respondeu ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as Record<string, any>;
    return {
      status: data.paid ? 'PAID' : 'PENDING',
      paidAmount: typeof data.paid_amount === 'number' ? data.paid_amount / 100 : undefined,
    };
  }

  parseWebhook(body: unknown, token: string | undefined): NormalizedWebhookEvent | null {
    // Sem HMAC documentado publicamente — a defesa é o token secreto na
    // própria webhook_url que enviamos ao criar a cobrança (ver createCharge).
    const expected = Buffer.from(this.webhookToken);
    const received = Buffer.from(token ?? '');
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return null;
    }

    const payload = body as Record<string, any>;
    if (!payload?.order_nsu) return null;

    return {
      externalId: payload.order_nsu,
      transactionNsu: payload.transaction_nsu,
      paidAmount: typeof payload.paid_amount === 'number' ? payload.paid_amount / 100 : 0,
      raw: payload,
    };
  }
}
