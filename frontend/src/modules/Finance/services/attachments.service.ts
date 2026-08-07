import { api } from '../../../api/api';

export interface AttachmentDTO {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  category: string | null;
  transactionId: string | null;
  personId: string | null;
  memberId: string | null;
  projectId: string | null;
  createdAt: string;
}

interface AttachmentTarget {
  transactionId?: string;
  personId?: string;
  memberId?: string;
  projectId?: string;
  category?: string;
}

export const attachmentsService = {
  async list(target: AttachmentTarget): Promise<AttachmentDTO[]> {
    const { data } = await api.get('/attachments', { params: target });
    return data.attachments;
  },

  async upload(file: File, target: AttachmentTarget): Promise<AttachmentDTO> {
    const { data: urlData } = await api.post('/attachments/upload-url', {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      category: target.category,
      transactionId: target.transactionId,
      personId: target.personId,
      memberId: target.memberId,
      projectId: target.projectId,
    });

    const putResponse = await fetch(urlData.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!putResponse.ok) {
      throw new Error(`Falha ao enviar arquivo ao Storage (status ${putResponse.status}).`);
    }

    const { data } = await api.post('/attachments', {
      storageKey: urlData.storageKey,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      category: target.category,
      transactionId: target.transactionId,
      personId: target.personId,
      memberId: target.memberId,
      projectId: target.projectId,
    });
    return data.attachment;
  },

  async getDownloadUrl(id: string): Promise<{ url: string; fileName: string }> {
    const { data } = await api.get(`/attachments/${id}/download-url`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/attachments/${id}`);
  },
};
