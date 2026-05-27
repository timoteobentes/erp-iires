import type { Request, Response } from 'express';
import prisma from '../../config/prisma.js';
import { ReportsService } from './reports.service.js';

export class ReportsController {
  
  // =========================================================
  // EXPORTAR RELATÓRIO
  // =========================================================
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { moduleType, format, sendToEmail, filters } = req.body;

      if (!moduleType || !format) {
        res.status(400).json({ error: 'Os campos moduleType e format são obrigatórios.' });
        return;
      }

      let data: any[] = [];
      let columns: any[] = [];
      let reportTitle = '';

      // =========================================================
      // DADOS: FINANCEIRO
      // =========================================================
      if (moduleType === 'financial') {
        const transactions = await prisma.transaction.findMany({
          where: filters || {},
          orderBy: { date: 'desc' },
          include: { project: true, donor: true, partner: true }
        });

        data = transactions.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type === 'INCOME' ? 'Entrada' : 'Saída',
          amount: t.amount,
          date: t.date.toISOString().split('T')[0],
          status: t.status,
          category: t.category,
          projectName: t.project?.name || 'N/A',
          donorName: t.donor?.name || 'N/A',
          partnerName: t.partner?.name || 'N/A'
        }));

        columns = [
          { header: 'Título', key: 'title', width: 30 },
          { header: 'Tipo', key: 'type', width: 15 },
          { header: 'Valor', key: 'amount', width: 15 },
          { header: 'Data', key: 'date', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Categoria', key: 'category', width: 20 },
          { header: 'Projeto', key: 'projectName', width: 25 },
          { header: 'Doador', key: 'donorName', width: 25 },
          { header: 'Parceiro', key: 'partnerName', width: 25 }
        ];

        reportTitle = 'Relatório Financeiro';

      // =========================================================
      // DADOS: DOADORES
      // =========================================================
      } else if (moduleType === 'donors') {
        const donors = await prisma.donor.findMany({
          where: filters || {},
          orderBy: { name: 'asc' }
        });

        data = donors.map(d => ({
          id: d.id,
          name: d.name,
          document: d.document,
          type: d.type,
          email: d.email || 'N/A',
          phone: d.phone || 'N/A',
          recurrence: d.recurrence,
          status: d.status
        }));

        columns = [
          { header: 'Nome', key: 'name', width: 30 },
          { header: 'Documento', key: 'document', width: 20 },
          { header: 'Tipo', key: 'type', width: 10 },
          { header: 'E-mail', key: 'email', width: 30 },
          { header: 'Telefone', key: 'phone', width: 20 },
          { header: 'Recorrência', key: 'recurrence', width: 15 },
          { header: 'Status', key: 'status', width: 15 }
        ];

        reportTitle = 'Relatório de Doadores';

      // =========================================================
      // DADOS: VOLUNTÁRIOS
      // =========================================================
      } else if (moduleType === 'volunteers') {
        const volunteers = await prisma.volunteer.findMany({
          where: filters || {},
          orderBy: { name: 'asc' }
        });

        data = volunteers.map((v: any) => ({
          name: v.name,
          email: v.email || 'N/A',
          phone: v.phone || 'N/A',
          profession: v.profession || 'N/A',
          skills: Array.isArray(v.skills) ? v.skills.join(', ') : 'N/A',
          availability: v.availability || 'N/A',
          status: v.status
        }));

        columns = [
          { header: 'Nome', key: 'name', width: 30 },
          { header: 'E-mail', key: 'email', width: 30 },
          { header: 'Telefone', key: 'phone', width: 20 },
          { header: 'Profissão', key: 'profession', width: 25 },
          { header: 'Habilidades', key: 'skills', width: 40 },
          { header: 'Disponibilidade', key: 'availability', width: 20 },
          { header: 'Status', key: 'status', width: 15 }
        ];

        reportTitle = 'Relatório de Voluntários';

      // =========================================================
      // DADOS: PARCEIROS
      // =========================================================
      } else if (moduleType === 'partners') {
        const partners = await prisma.partner.findMany({
          where: filters || {},
          orderBy: { name: 'asc' }
        });

        data = partners.map((p: any) => ({
          name: p.name,
          cnpj: p.cnpj || 'N/A',
          partnershipType: p.partnershipType,
          contactName: p.contactName || 'N/A',
          email: p.email || 'N/A',
          phone: p.phone || 'N/A',
          status: p.status
        }));

        columns = [
          { header: 'Nome', key: 'name', width: 30 },
          { header: 'CNPJ/CPF', key: 'cnpj', width: 20 },
          { header: 'Tipo', key: 'partnershipType', width: 15 },
          { header: 'Contato', key: 'contactName', width: 25 },
          { header: 'E-mail', key: 'email', width: 30 },
          { header: 'Telefone', key: 'phone', width: 20 },
          { header: 'Status', key: 'status', width: 15 }
        ];

        reportTitle = 'Relatório de Parceiros e Fornecedores';

      // =========================================================
      // DADOS: PROJETOS
      // =========================================================
      } else if (moduleType === 'projects') {
        const projects = await prisma.project.findMany({
          where: filters || {},
          orderBy: { name: 'asc' },
          include: {
            manager: { select: { name: true } },
            volunteers: { select: { name: true } },
            partners: { select: { name: true } }
          }
        });

        data = projects.map((p: any) => ({
          name: p.name,
          description: p.description || 'N/A',
          status: p.status,
          manager: p.manager?.name || 'N/A',
          volunteers: p.volunteers.map((v: any) => v.name).join(', ') || 'N/A',
          partners: p.partners.map((pt: any) => pt.name).join(', ') || 'N/A',
          startDate: p.startDate ? p.startDate.toISOString().split('T')[0] : 'N/A',
          endDate: p.endDate ? p.endDate.toISOString().split('T')[0] : 'N/A'
        }));

        columns = [
          { header: 'Nome', key: 'name', width: 30 },
          { header: 'Descrição', key: 'description', width: 40 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Responsável', key: 'manager', width: 25 },
          { header: 'Voluntários', key: 'volunteers', width: 40 },
          { header: 'Parceiros', key: 'partners', width: 40 },
          { header: 'Início', key: 'startDate', width: 15 },
          { header: 'Término', key: 'endDate', width: 15 }
        ];

        reportTitle = 'Relatório de Projetos';

      } else {
        res.status(400).json({ error: 'moduleType inválido. Use "financial", "donors", "volunteers", "partners" ou "projects".' });
        return;
      }

      if (data.length === 0) {
        res.status(404).json({ error: 'Nenhum dado encontrado para os filtros informados.' });
        return;
      }

      // =========================================================
      // GERAÇÃO DE ARQUIVO
      // =========================================================
      let buffer: Buffer;
      let contentType = '';
      let fileExtension = '';

      if (format === 'xlsx') {
        buffer = await ReportsService.generateExcel(data, columns);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      } else if (format === 'csv') {
        buffer = await ReportsService.generateCSV(data, columns);
        contentType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'pdf') {
        buffer = await ReportsService.generatePDF(data, reportTitle);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
      } else {
        res.status(400).json({ error: 'format inválido. Use "xlsx", "csv" ou "pdf".' });
        return;
      }

      const filename = `relatorio-${moduleType}-${new Date().getTime()}.${fileExtension}`;

      // =========================================================
      // RETORNO (E-mail ou Download Direto)
      // =========================================================
      if (sendToEmail) {
        await ReportsService.sendEmailWithAttachment(
          sendToEmail,
          reportTitle,
          `Olá, segue em anexo o ${reportTitle} solicitado.`,
          buffer,
          filename,
          contentType
        );
        res.status(200).json({ message: 'Relatório enviado por e-mail com sucesso!' });
      } else {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
      }

    } catch (error) {
      console.error('Erro no Export Report:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório.' });
    }
  }
}
