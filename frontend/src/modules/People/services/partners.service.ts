import { api } from '../../../api/api';
import { stripMask } from '../../../utils/masks';

// ============================================================
// TIPOS
// ============================================================

export interface PartnerAddress {
  id: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Partner {
  id: string;
  name: string;
  cnpj: string; // CNPJ ou CPF sem máscara
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  partnershipType: string; // 'Fornecedor' | 'Parceiro'
  status: string;
  createdAt?: string;
  address?: PartnerAddress | null;
}

// Payload interno do formulário (campos no estilo do form)
export interface PartnerFormData {
  type: string;       // 'Fornecedor' | 'Parceiro' → mapeado para partnershipType
  document: string;   // CNPJ/CPF com máscara → mapeado para cnpj (sem máscara)
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  cep?: string;
  address?: string;   // → backend mapeia para street
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// Payload enviado ao backend (campos exatos do controller)
export interface PartnerPayload {
  name: string;
  cnpj: string;
  contactName?: string;
  email?: string;
  phone?: string;
  partnershipType: string;
  cep?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// ============================================================
// MAPEAMENTO form → backend
// ============================================================

function toPayload(formData: PartnerFormData): PartnerPayload {
  return {
    name: formData.name,
    cnpj: stripMask(formData.document ?? ''),
    contactName: formData.contactName,
    email: formData.email,
    phone: formData.phone,
    partnershipType: formData.type,
    cep: formData.cep,
    address: formData.address,
    number: formData.number,
    neighborhood: formData.neighborhood,
    city: formData.city,
    state: formData.state,
  };
}

// ============================================================
// SERVICE
// ============================================================

export const partnersService = {
  async list(): Promise<Partner[]> {
    const response = await api.get('/partners');
    return response.data;
  },

  async getById(id: string): Promise<Partner> {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },

  async create(data: PartnerFormData): Promise<{ message: string; partner: Partner }> {
    const response = await api.post('/partners', toPayload(data));
    return response.data;
  },

  async update(
    id: string,
    data: Partial<PartnerFormData>,
  ): Promise<{ message: string; partner: Partner }> {
    const payload: Partial<PartnerPayload> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.partnershipType = data.type;
    if (data.document !== undefined) payload.cnpj = stripMask(data.document);
    if (data.contactName !== undefined) payload.contactName = data.contactName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.cep !== undefined) payload.cep = data.cep;
    if (data.address !== undefined) payload.address = data.address;
    if (data.number !== undefined) payload.number = data.number;
    if (data.neighborhood !== undefined) payload.neighborhood = data.neighborhood;
    if (data.city !== undefined) payload.city = data.city;
    if (data.state !== undefined) payload.state = data.state;

    const response = await api.put(`/partners/${id}`, payload);
    return response.data;
  },

  async inactivate(id: string): Promise<{ message: string }> {
    const response = await api.patch(`/partners/${id}/inactivate`);
    return response.data;
  },
};
