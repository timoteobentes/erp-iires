import prisma from '../../config/prisma.js';
import { MailService } from '../../shared/services/mail.service.js';
import { getOrCreateCheckoutInvoice } from '../../modules/Billing/billing.service.js';

const REMINDER_WINDOW_DAYS = 7;

/**
 * Roda uma vez por dia. Plano B de cobrança (ver docs/BILLING.md e a decisão
 * registrada no projeto): sem régua de dunning automática — só gera a fatura
 * do próximo período e manda um lembrete por e-mail quando faltam até 7 dias
 * para o vencimento. Idempotente: só manda o lembrete uma vez por fatura.
 */
export async function runBillingReminderJob(): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + REMINDER_WINDOW_DAYS);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: { in: ['TRIALING', 'ACTIVE'] },
      currentPeriodEnd: { gte: now, lte: windowEnd },
    },
    include: { plan: true, organization: true },
  });

  for (const subscription of subscriptions) {
    try {
      const invoice = await getOrCreateCheckoutInvoice(subscription, subscription.organization);

      if (invoice.remindersSentAt.length > 0) continue; // já lembramos desta fatura

      await MailService.sendMail({
        to: subscription.organization.email,
        subject: `Sua assinatura SIGETES vence em breve — plano ${subscription.plan.name}`,
        text:
          `Olá, ${subscription.organization.tradeName ?? subscription.organization.legalName}!\n\n` +
          `Sua assinatura do plano ${subscription.plan.name} vence em ${invoice.dueDate.toLocaleDateString('pt-BR')}. ` +
          `Para continuar usando o SIGETES sem interrupção, pague pelo link abaixo:\n\n${invoice.checkoutUrl}\n\n` +
          `Equipe SIGETES.`,
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { remindersSentAt: { push: new Date() } },
      });

      console.log(`[billing-reminder] lembrete enviado para ${subscription.organization.slug}`);
    } catch (error) {
      console.error(`[billing-reminder] falha para a organização ${subscription.organizationId}:`, error);
    }
  }
}
