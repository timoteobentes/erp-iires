import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { MailService } from '../../shared/services/mail.service.js';

export class ReportsService {
  
  // =========================================================
  // 1. Gerar Excel (XLSX)
  // =========================================================
  static async generateExcel(data: any[], columns: { header: string, key: string, width?: number }[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    worksheet.columns = columns;

    data.forEach(item => {
      worksheet.addRow(item);
    });

    // writeBuffer retorna um buffer do Excel
    const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer;
    return buffer;
  }

  // =========================================================
  // 2. Gerar CSV
  // =========================================================
  static async generateCSV(data: any[], columns: { header: string, key: string, width?: number }[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    worksheet.columns = columns;

    data.forEach(item => {
      worksheet.addRow(item);
    });

    const buffer = await workbook.csv.writeBuffer() as unknown as Buffer;
    return buffer;
  }

  // =========================================================
  // 3. Gerar PDF
  // =========================================================
  static async generatePDF(data: any[], title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // Cabeçalho
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Tabela Simples (Lista)
        data.forEach((item, index) => {
          doc.fontSize(10).text(`${index + 1}. `, { continued: true, stroke: true });
          
          Object.keys(item).forEach((key) => {
            if (item[key] !== undefined && item[key] !== null) {
              doc.text(`${key}: ${item[key]} | `, { continued: true });
            }
          });
          doc.text(' '); // Quebra de linha
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // =========================================================
  // 4. Enviar E-mail com Anexo
  // =========================================================
  static async sendEmailWithAttachment(
    to: string, 
    subject: string, 
    text: string, 
    attachmentBuffer: Buffer, 
    filename: string, 
    contentType: string
  ): Promise<void> {
    await MailService.sendMail({
      to,
      subject,
      text,
      attachments: [
        {
          filename,
          content: attachmentBuffer,
          contentType
        }
      ]
    });
  }
}
