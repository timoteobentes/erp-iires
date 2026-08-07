import type { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { InfinitePayGateway } from '../../core/billing/gateways/infinitepay.gateway.js';
import type { PaymentGateway } from '../../core/billing/gateway.interface.js';

const gateway: PaymentGateway = new InfinitePayGateway();

// POST /api/webhooks/infinitepay?token=...
// Fica FORA do authMiddleware/contexto de tenant — usa o Prisma cru.
// Ver docs/BILLING.md §2 (idempotência via WebhookEvent, nunca confiar
// no valor do payload sem conferir contra a Invoice local).
export async function infinitePayWebhook(req: Request, res: Response): Promise<void> {
  const token = typeof req.query.token === 'string' ? req.query.token : undefined;
  const event = gateway.parseWebhook(req.body, token);

  if (!event) {
    res.status(401).json({ error: 'Webhook inválido.' });
    return;
  }

  // Grava o evento ANTES de processar — se já existir (mesma invoice),
  // o unique constraint garante que não processamos duas vezes.
  try {
    await prisma.webhookEvent.create({
      data: {
        gateway: gateway.name,
        externalId: event.externalId,
        type: 'payment',
        payload: event.raw as any,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(200).json({ message: 'Evento já processado.' });
      return;
    }
    console.error('Erro ao gravar WebhookEvent:', error);
    res.status(500).json({ error: 'Erro ao registrar webhook.' });
    return;
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { externalId: event.externalId },
      include: { subscription: true },
    });

    if (!invoice) {
      await prisma.webhookEvent.update({
        where: { gateway_externalId: { gateway: gateway.name, externalId: event.externalId } },
        data: { error: 'Invoice não encontrada para este externalId.' },
      });
      res.status(200).json({ message: 'Evento recebido, mas sem fatura correspondente.' });
      return;
    }

    // Nunca confiar cegamente no valor do payload — conferir contra a Invoice local.
    if (Math.abs(event.paidAmount - Number(invoice.amount)) > 0.01) {
      await prisma.webhookEvent.update({
        where: { gateway_externalId: { gateway: gateway.name, externalId: event.externalId } },
        data: { error: `Valor pago (${event.paidAmount}) diverge da fatura (${invoice.amount}).` },
      });
      res.status(200).json({ message: 'Evento recebido, divergência de valor registrada para revisão manual.' });
      return;
    }

    const paidAt = new Date();
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'PAID', paidAt, method: 'PIX' },
    });

    await prisma.subscription.update({
      where: { id: invoice.subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: invoice.periodStart,
        currentPeriodEnd: invoice.periodEnd,
        lastChargedAt: paidAt,
      },
    });

    await prisma.webhookEvent.update({
      where: { gateway_externalId: { gateway: gateway.name, externalId: event.externalId } },
      data: { processedAt: new Date() },
    });

    res.status(200).json({ message: 'Pagamento confirmado.' });
  } catch (error) {
    console.error('Erro ao processar webhook InfinitePay:', error);
    res.status(500).json({ error: 'Erro ao processar webhook.' });
  }
}
