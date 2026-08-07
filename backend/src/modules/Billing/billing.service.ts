import prisma from '../../config/prisma.js';
import { InfinitePayGateway } from '../../core/billing/gateways/infinitepay.gateway.js';
import type { PaymentGateway } from '../../core/billing/gateway.interface.js';
import type { Subscription, Plan, Organization } from '@prisma/client';

const gateway: PaymentGateway = new InfinitePayGateway();

function addInterval(date: Date, interval: 'MONTHLY' | 'YEARLY'): Date {
  const next = new Date(date);
  if (interval === 'YEARLY') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * Garante que existe uma fatura PENDING com link de pagamento para o
 * próximo período da assinatura — cria se não existir, reaproveita se já
 * existir (idempotente). Usado tanto pelo botão "Pagar agora" quanto pelo
 * job de lembrete diário.
 */
export async function getOrCreateCheckoutInvoice(
  subscription: Subscription & { plan: Plan },
  organization: Organization,
) {
  let invoice = await prisma.invoice.findFirst({
    where: { subscriptionId: subscription.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  if (invoice?.checkoutUrl) return invoice;

  const periodStart = subscription.currentPeriodEnd ?? new Date();
  const periodEnd = addInterval(periodStart, subscription.interval);
  const amount = subscription.interval === 'YEARLY'
    ? Number(subscription.plan.priceYearly)
    : Number(subscription.plan.priceMonthly);

  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        status: 'PENDING',
        periodStart,
        periodEnd,
        dueDate: periodStart,
      },
    });
  }

  const charge = await gateway.createCharge({
    organizationId: organization.id,
    invoiceId: invoice.id,
    amount,
    description: `Assinatura SIGETES — plano ${subscription.plan.name}`,
    payer: { name: organization.legalName, email: organization.email },
  });

  return prisma.invoice.update({
    where: { id: invoice.id },
    data: { externalId: charge.externalId, checkoutUrl: charge.checkoutUrl },
  });
}
