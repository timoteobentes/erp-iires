import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  legalName: z.string().trim().min(2).max(200).optional(),
  tradeName: z.string().trim().max(200).nullable().optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  website: z.string().trim().max(200).nullable().optional(),
  zipCode: z.string().trim().max(15).nullable().optional(),
  street: z.string().trim().max(200).nullable().optional(),
  number: z.string().trim().max(20).nullable().optional(),
  complement: z.string().trim().max(100).nullable().optional(),
  neighborhood: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(2).nullable().optional(),
  legalRepName: z.string().trim().max(200).nullable().optional(),
  legalRepDocument: z.string().trim().max(20).nullable().optional(),
  legalRepRole: z.string().trim().max(120).nullable().optional(),
  legalRepEmail: z.string().email().nullable().optional(),
  logoUrl: z.string().trim().max(500).nullable().optional(),
  brandColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
});
