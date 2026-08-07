import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const entityLinks = {
  transactionId: z.string().uuid().optional(),
  personId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
};

export const requestUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]]),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  category: z.string().trim().max(50).optional(),
  ...entityLinks,
});

export const confirmUploadSchema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().trim().min(1).max(200),
  mimeType: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]]),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  category: z.string().trim().max(50).optional(),
  ...entityLinks,
});
