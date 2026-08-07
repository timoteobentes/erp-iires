import type { Request, Response } from 'express';
import { tenantPrisma as prisma } from '../../core/prisma/tenant-client.js';
import { getContext } from '../../core/context/request-context.js';
import { respondError } from '../../shared/utils/respond-error.js';
import { getOrCreateCheckoutInvoice } from './billing.service.js';

export class BillingController {
  // GET /billing/subscription
  async getSubscription(_req: Request, res: Response): Promise<void> {
    try {
      const subscription = await prisma.subscription.findFirst({ include: { plan: true } });
      if (!subscription) {
        res.status(404).json({ error: 'Esta organização ainda não tem uma assinatura.' });
        return;
      }

      const pendingInvoice = await prisma.invoice.findFirst({
        where: { subscriptionId: subscription.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ subscription, pendingInvoice });
    } catch (error) {
      respondError(res, error, 'Erro ao buscar assinatura.');
    }
  }

  // POST /billing/checkout — gera (ou reaproveita) a cobrança do próximo período
  async checkout(_req: Request, res: Response): Promise<void> {
    try {
      const subscription = await prisma.subscription.findFirst({ include: { plan: true } });
      if (!subscription) {
        res.status(404).json({ error: 'Esta organização ainda não tem uma assinatura.' });
        return;
      }

      const organization = await prisma.organization.findUnique({ where: { id: getContext().organizationId } });
      if (!organization) {
        res.status(404).json({ error: 'Organização não encontrada.' });
        return;
      }

      const invoice = await getOrCreateCheckoutInvoice(subscription, organization);
      res.status(200).json({ checkoutUrl: invoice.checkoutUrl, invoiceId: invoice.id });
    } catch (error) {
      respondError(res, error, 'Erro ao gerar cobrança.');
    }
  }
}
