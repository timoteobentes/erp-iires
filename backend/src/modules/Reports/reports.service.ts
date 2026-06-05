import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { resolve as resolvePath, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MailService } from '../../shared/services/mail.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const LOGO_PATH  = resolvePath(__dirname, '../../assets/logo-original.png');

// A4 dimensions in points (72 dpi)
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MX     = 50;           // horizontal margin
const CW     = PAGE_W - MX * 2; // content width = 495.28

// Palette
const C = {
  dark:   '#0e0e1a',
  header: '#0e0e1a',
  white:  '#ffffff',
  alt:    '#f7f8fa',
  border: '#e2e5ea',
  muted:  '#9ca3af',
  accent: '#3b82f6',
};

export class ReportsService {

  // =========================================================
  // 1. Gerar Excel (XLSX)
  // =========================================================
  static async generateExcel(
    data: any[],
    columns: { header: string; key: string; width?: number }[],
  ): Promise<Buffer> {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    worksheet.columns = columns;

    // Header row styling
    const headerRow = worksheet.getRow(1);
    headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E0E1A' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.height    = 22;

    data.forEach((item, i) => {
      const row = worksheet.addRow(item);
      if (i % 2 === 1) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } };
      }
    });

    // Auto-border on all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E5EA' } },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer;
    return buffer;
  }

  // =========================================================
  // 2. Gerar CSV
  // =========================================================
  static async generateCSV(
    data: any[],
    columns: { header: string; key: string; width?: number }[],
  ): Promise<Buffer> {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');
    worksheet.columns = columns;
    data.forEach((item) => worksheet.addRow(item));
    const buffer = await workbook.csv.writeBuffer() as unknown as Buffer;
    return buffer;
  }

  // =========================================================
  // 3. Gerar PDF (template IIRes)
  // =========================================================
  static async generatePDF(
    data: any[],
    title: string,
    columns: { header: string; key: string; width?: number }[],
    filters?: { startDate?: string; endDate?: string; status?: string },
  ): Promise<Buffer> {
    return new Promise((resolvePromise, reject) => {
      try {
        const doc    = new PDFDocument({ margin: 0, size: 'A4' });
        const chunks: Buffer[] = [];
        doc.on('data',  (c)   => chunks.push(c));
        doc.on('end',   ()    => resolvePromise(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const hasLogo    = existsSync(LOGO_PATH);
        const FOOTER_Y   = PAGE_H - 50;
        const ROW_H      = 20;
        const HEADER_H   = 24;

        // Proportional column widths
        const totalHint = columns.reduce((s, c) => s + (c.width ?? 15), 0);
        const colW      = columns.map((c) => ((c.width ?? 15) / totalHint) * CW);

        // ── helpers ──────────────────────────────────────────

        const drawWatermark = () => {
          if (!hasLogo) return;
          // Draw logo at low opacity in the bottom-right corner
          doc.save();
          doc.opacity(0.07);
          doc.image(LOGO_PATH, PAGE_W - 295, PAGE_H - 270, { width: 255 });
          doc.restore();
        };

        const drawPageFooter = () => {
          doc
            .moveTo(MX, FOOTER_Y)
            .lineTo(PAGE_W - MX, FOOTER_Y)
            .strokeColor(C.border)
            .lineWidth(0.5)
            .stroke();
          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor(C.muted)
            .text(
              'IIRES - Instituto de Inovação e Responsabilidade Social da Amazônia',
              MX, FOOTER_Y + 7,
              { align: 'center', width: CW },
            );
          doc
            .text(
              'CNPJ. 10.441.981/0001-66  •  Manaus – Amazonas  •  www.iires.org',
              MX, FOOTER_Y + 19,
              { align: 'center', width: CW },
            );
        };

        const drawTableHeader = (y: number): number => {
          doc.rect(MX, y, CW, HEADER_H).fill(C.header);
          let x = MX;
          columns.forEach((col, i) => {
            const w = colW[i] ?? 0;
            doc
              .font('Helvetica-Bold')
              .fontSize(7.5)
              .fillColor(C.white)
              .text(col.header.toUpperCase(), x + 5, y + 8, {
                width: w - 10,
                ellipsis: true,
                lineBreak: false,
              });
            x += w;
          });
          return y + HEADER_H;
        };

        // ── first page ────────────────────────────────────────

        drawWatermark();

        // Logo
        let y = 28;
        if (hasLogo) {
          doc.image(LOGO_PATH, MX, y, { width: 95 });
        }

        // "Gerado em" top-right
        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor(C.muted)
          .text(
            `Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
            MX, y + 40,
            { align: 'right', width: CW },
          );

        y = 82;
        doc.moveTo(MX, y).lineTo(PAGE_W - MX, y).strokeColor(C.border).lineWidth(0.5).stroke();
        y += 14;

        // Report title
        doc.font('Helvetica-Bold').fontSize(14).fillColor(C.dark).text(title, MX, y, { width: CW });
        y += 22;

        // Period / total records
        const meta: string[] = [`Total de registros: ${data.length}`];
        const fStart = filters?.startDate;
        const fEnd   = filters?.endDate;
        if (fStart && fEnd) {
          const s = new Date(`${fStart}T00:00:00`).toLocaleDateString('pt-BR');
          const e = new Date(`${fEnd}T00:00:00`).toLocaleDateString('pt-BR');
          meta.unshift(`Período: ${s} – ${e}`);
        }
        doc.font('Helvetica').fontSize(8).fillColor(C.muted).text(meta.join('     '), MX, y, { width: CW });
        y += 20;

        // Table
        y = drawTableHeader(y);

        // ── data rows ─────────────────────────────────────────
        data.forEach((row, idx) => {
          // Page break?
          if (y + ROW_H > FOOTER_Y - 4) {
            drawPageFooter();
            doc.addPage({ margin: 0, size: 'A4' });
            drawWatermark();
            y = 32;
            doc
              .font('Helvetica-Bold')
              .fontSize(11)
              .fillColor(C.dark)
              .text(`${title} (continuação)`, MX, y, { width: CW });
            y += 18;
            y = drawTableHeader(y);
          }

          // Row background
          const bg = idx % 2 === 1 ? C.alt : C.white;
          doc.rect(MX, y, CW, ROW_H).fill(bg);
          // Row bottom border
          doc
            .moveTo(MX, y + ROW_H)
            .lineTo(MX + CW, y + ROW_H)
            .strokeColor(C.border)
            .lineWidth(0.3)
            .stroke();

          // Cells
          let x = MX;
          columns.forEach((col, i) => {
            const w   = colW[i] ?? 0;
            const val = row[col.key] != null ? String(row[col.key]) : '—';
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(C.dark)
              .text(val, x + 5, y + 6, {
                width: w - 10,
                ellipsis: true,
                lineBreak: false,
              });
            x += w;
          });

          y += ROW_H;
        });

        drawPageFooter();
        doc.end();
      } catch (err) {
        reject(err);
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
    contentType: string,
  ): Promise<void> {
    await MailService.sendMail({
      to,
      subject,
      text,
      attachments: [{ filename, content: attachmentBuffer, contentType }],
    });
  }
}
