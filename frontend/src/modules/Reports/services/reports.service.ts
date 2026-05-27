import { api } from '../../../api/api';

// ============================================================
// TIPOS
// ============================================================

export type ReportModuleType = 'financial' | 'donors' | 'volunteers' | 'partners' | 'projects';
export type ReportFormat = 'xlsx' | 'csv' | 'pdf';

export interface ReportExportPayload {
  moduleType: ReportModuleType;
  format: ReportFormat;
  sendToEmail?: string;
  filters?: Record<string, any>;
}

// ============================================================
// SERVICE
// ============================================================

export const reportsService = {
  /**
   * Exporta um relatório.
   * - Se sendToEmail for informado, retorna um JSON com { message }.
   * - Se não, retorna um Blob para download.
   */
  async exportReport(payload: ReportExportPayload): Promise<Blob | { message: string }> {
    if (payload.sendToEmail) {
      const { data } = await api.post<{ message: string }>('/reports/export', payload);
      return data;
    }

    const response = await api.post('/reports/export', payload, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  /**
   * Aciona o download de um Blob no navegador.
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
