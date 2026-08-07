import { api } from '../../../api/api';

export interface Plan {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  priceMonthly: string;
  priceYearly: string;
}

export interface Subscription {
  id: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELED';
  interval: 'MONTHLY' | 'YEARLY';
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  plan: Plan;
}

export interface Invoice {
  id: string;
  amount: string;
  status: string;
  dueDate: string;
  checkoutUrl: string | null;
}

export const billingService = {
  async getSubscription(): Promise<{ subscription: Subscription; pendingInvoice: Invoice | null }> {
    const { data } = await api.get('/billing/subscription');
    return data;
  },

  async checkout(): Promise<{ checkoutUrl: string; invoiceId: string }> {
    const { data } = await api.post('/billing/checkout');
    return data;
  },
};
