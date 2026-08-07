import { api } from '../../../api/api';
import { donorsService } from './donors.service';
import { partnersService } from './partners.service';
import { stripMask } from '../../../utils/masks';

// ============================================================
// Doador, Voluntário e Parceiro são todos a mesma tabela no banco
// (Person, com uma lista de "papéis"). Este serviço junta as duas
// pontas hoje expostas pelo backend (/donors e /partners) numa
// única visão de "Rede de Apoio".
// ============================================================

export interface NetworkPerson {
  id: string;
  kind: 'INDIVIDUAL' | 'COMPANY';
  roles: string[];
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  donationRecurrence: string | null;
  preferredPayment: string | null;
  partnershipType: string | null;
  contactName: string | null;
  status: string;
  createdAt?: string;
}

export interface NetworkFormValues {
  isDonor: boolean;
  isPartner: boolean;
  personKind: 'PF' | 'PJ';
  name: string;
  document: string; // com máscara — a service tira
  phone?: string;
  email?: string;
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  recurrence?: string;
  paymentMethod?: string;
  partnershipType?: string;
  contactName?: string;
}

function mergeById(donors: NetworkPerson[], partners: NetworkPerson[]): NetworkPerson[] {
  const map = new Map<string, NetworkPerson>();
  for (const item of [...donors, ...partners]) {
    const prev = map.get(item.id);
    map.set(item.id, prev ? { ...prev, roles: Array.from(new Set([...prev.roles, ...item.roles])) } : item);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function addressFields(v: Partial<NetworkFormValues>) {
  return {
    cep: v.cep, address: v.address, number: v.number,
    neighborhood: v.neighborhood, city: v.city, state: v.state,
  };
}

export const networkService = {
  async list(): Promise<NetworkPerson[]> {
    const [donors, partners] = await Promise.all([
      donorsService.list() as unknown as Promise<NetworkPerson[]>,
      partnersService.list() as unknown as Promise<NetworkPerson[]>,
    ]);
    return mergeById(donors, partners);
  },

  // getById não filtra por papel no backend — funciona para qualquer Person.
  async getById(id: string): Promise<NetworkPerson> {
    return donorsService.getById(id) as unknown as Promise<NetworkPerson>;
  },

  async create(v: NetworkFormValues): Promise<void> {
    const document = stripMask(v.document);

    if (v.isDonor) {
      const { data: res } = await api.post('/donors', {
        type: v.personKind, name: v.name, document, phone: v.phone, email: v.email,
        recurrence: v.recurrence, paymentMethod: v.paymentMethod, ...addressFields(v),
      });
      void res;
    }
    if (v.isPartner) {
      await api.post('/partners', {
        personKind: v.personKind, cnpj: document, name: v.name,
        contactName: v.contactName, phone: v.phone, email: v.email,
        partnershipType: v.partnershipType || 'Parceiro', ...addressFields(v),
      });
    }
  },

  /** Adiciona um papel a uma pessoa que já existe (mesmo documento). */
  async addRole(current: NetworkPerson, role: 'DONOR' | 'PARTNER', extra: Partial<NetworkFormValues>): Promise<void> {
    const document = current.document ?? '';
    if (role === 'DONOR') {
      await api.post('/donors', {
        type: current.kind === 'INDIVIDUAL' ? 'PF' : 'PJ', name: current.name, document,
        phone: current.phone, email: current.email,
        recurrence: extra.recurrence, paymentMethod: extra.paymentMethod,
      });
    } else {
      await api.post('/partners', {
        personKind: current.kind === 'INDIVIDUAL' ? 'PF' : 'PJ', cnpj: document, name: current.name,
        contactName: extra.contactName, phone: current.phone, email: current.email,
        partnershipType: extra.partnershipType || 'Parceiro',
      });
    }
  },

  async update(id: string, current: NetworkPerson, v: Partial<NetworkFormValues>): Promise<void> {
    // Campos comuns (nome, contato, endereço) — o endpoint de doadores atualiza
    // o registro de Pessoa como um todo, independente do papel.
    await api.put(`/donors/${id}`, {
      name: v.name, phone: v.phone, email: v.email,
      recurrence: v.recurrence, paymentMethod: v.paymentMethod,
      ...addressFields(v),
    });

    if (current.roles.includes('PARTNER') || v.isPartner) {
      await api.put(`/partners/${id}`, {
        contactName: v.contactName, partnershipType: v.partnershipType,
      });
    }
  },

  async inactivate(id: string): Promise<void> {
    await donorsService.inactivate(id);
  },
};
