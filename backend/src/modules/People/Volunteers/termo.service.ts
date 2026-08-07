import PDFDocument from 'pdfkit';

interface VolunteerTermoData {
  name: string;
  document?: string | null;
  rg?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  profession?: string | null;
  services?: string | null;
  schedule?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  zipCode?: string | null;
  city?: string | null;
  state?: string | null;
  supervisor?: { name: string } | null;
}

const blank = '_______________';

function fmt(value: string | null | undefined, fallback = blank): string {
  return value?.trim() || fallback;
}

function formatCEP(cep: string | null | undefined): string {
  if (!cep) return blank;
  const digits = cep.replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return cep;
}

function sectionTitle(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.moveDown(0.8).font('Helvetica-Bold').fontSize(10).text(text, { align: 'left' }).moveDown(0.3);
}

function body(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.font('Helvetica').fontSize(10).text(text, { align: 'justify', lineGap: 2 }).moveDown(0.6);
}

export async function generateVolunteerTermoPDF(volunteer: VolunteerTermoData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 70, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageW = 595.28;
    const margin = 70;

    // ── Cabeçalho ──────────────────────────────────────────────
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('TERMO DE ADESÃO PARA TRABALHO VOLUNTÁRIO', { align: 'center' })
      .moveDown(1.5);

    // ── Bloco da Entidade ───────────────────────────────────────
    doc
      .font('Helvetica-Bold').fontSize(10).text('ENTIDADE: ', { continued: true })
      .font('Helvetica').fontSize(10).text(
        'Instituto de Inovação e Responsabilidade Social da Amazônia - IIRES, com sede em Manaus, ' +
        'na Av. Governador Danilo Matos Areosa nº 160, sala 11, bairro Distrito Industrial I, ' +
        'CEP: 69.075-351, inscrito no CNPJ sob o nº 10.441.981/0001-66, representada, neste ato, ' +
        'por seu Presidente, Adm. Rafael Veiga Paixão, brasileiro, solteiro, advogado, CPF nº 977.320.442-15.',
        { align: 'justify', lineGap: 2 }
      )
      .moveDown(1);

    // ── Bloco do Voluntário ─────────────────────────────────────
    const street       = fmt(volunteer.street);
    const number       = fmt(volunteer.number, 's/n');
    const neighborhood = fmt(volunteer.neighborhood);
    const cep          = formatCEP(volunteer.zipCode);
    const city         = fmt(volunteer.city, 'Manaus');
    const state        = fmt(volunteer.state, 'AM');

    doc
      .font('Helvetica-Bold').fontSize(10).text('VOLUNTÁRIO: ', { continued: true })
      .font('Helvetica').fontSize(10).text(
        `${volunteer.name}, ${fmt(volunteer.nationality, 'brasileiro(a)')}, ` +
        `${fmt(volunteer.maritalStatus)}, ${fmt(volunteer.profession)}, ` +
        `Carteira de Identidade nº ${fmt(volunteer.rg)}, CPF nº ${fmt(volunteer.document)}, ` +
        `residente e domiciliado na ${street}, nº ${number}, ` +
        `Bairro ${neighborhood}, CEP nº ${cep}, ` +
        `Município de ${city}, Estado de ${state}.`,
        { align: 'justify', lineGap: 2 }
      )
      .moveDown(1);

    body(doc,
      'As partes acima identificadas têm, entre si, justo e acertado, o presente Termo de Adesão, ' +
      'que se regerá pelas cláusulas seguintes e pelas condições descritas.'
    );

    // ── Cláusulas ───────────────────────────────────────────────
    sectionTitle(doc, 'DO OBJETO DO TERMO DE ADESÃO');
    body(doc,
      'Cláusula 1ª. O presente termo tem como OBJETO a regulamentação dos serviços que serão ' +
      'prestados pelo voluntário, não gerando estes vínculo empregatício, nos termos da Lei nº 9.608.'
    );

    sectionTitle(doc, 'DAS OBRIGAÇÕES DO VOLUNTÁRIO');
    body(doc,
      `Cláusula 2ª. O voluntário se compromete a auxiliar a entidade somente na função que lhe couber, ` +
      `executando os seguintes serviços: ${fmt(volunteer.services)}.\n\n` +
      `Parágrafo único. Caso o voluntário deseje atuar em outras atividades da entidade durante a vigência ` +
      `deste instrumento, deverá solicitar, mediante documento escrito, que lhe seja permitido a participação ` +
      `na atividade pretendida, cujo aceite pela Entidade dependerá, também, da compatibilidade entre os ` +
      `horários das tarefas e os definidos na cláusula 3ª deste instrumento.`
    );

    sectionTitle(doc, 'DA EXECUÇÃO');
    body(doc,
      `Cláusula 3ª. O voluntário exercerá suas atividades na Entidade, ${fmt(volunteer.schedule, 'conforme acordado entre as partes')}.\n\n` +
      `Parágrafo único. O horário estabelecido no caput da presente cláusula é estipulado mediante pleno ` +
      `acordo entre os contratantes, podendo ser revisto e alterado a qualquer momento, por iniciativa de ` +
      `qualquer das partes, desde que conte com o expresso consentimento da outra.`
    );

    sectionTitle(doc, 'DA REMUNERAÇÃO');
    body(doc,
      'Cláusula 4ª. Os serviços prestados pelo voluntário são de caráter gratuito, não cabendo, pois, ' +
      'remuneração a título de contraprestação, não havendo vínculo trabalhista e nem obrigação de ' +
      'natureza trabalhista, previdenciária ou afim.'
    );

    sectionTitle(doc, 'DAS OBRIGAÇÕES DA ENTIDADE');
    body(doc,
      'Cláusula 5ª. A entidade se compromete a ressarcir ao Voluntário as despesas que este realizar ' +
      'para o cumprimento das atividades estipuladas na cláusula 2ª do presente contrato, desde que ' +
      'haja a comprovação mediante nota fiscal.\n\n' +
      'Parágrafo primeiro. O reembolso será feito mediante assinatura de recibo por parte do voluntário.\n\n' +
      'Parágrafo segundo. Caso o voluntário não deseje o reembolso, deverá se manifestar expressamente, ' +
      'mediante termo escrito, desonerando, assim, a entidade do compromisso estipulado no caput da presente cláusula.'
    );

    sectionTitle(doc, 'DO PRAZO');
    body(doc, 'Cláusula 6ª. O presente termo de adesão será por prazo indeterminado.');

    sectionTitle(doc, 'DA RESCISÃO');
    body(doc,
      'Cláusula 7ª. O presente termo poderá ser rescindido por qualquer uma das partes, devendo a outra ' +
      'parte ser comunicada com antecedência mínima de 20 (vinte) dias.'
    );

    sectionTitle(doc, 'DAS CONDIÇÕES GERAIS');
    body(doc, 'Cláusula 8ª. O presente termo de adesão passa a viger a partir de sua assinatura pelas partes.');

    sectionTitle(doc, 'DO FORO');
    body(doc,
      'Cláusula 9ª. Para dirimir quaisquer controvérsias oriundas deste termo de adesão, as partes ' +
      'elegem o foro da comarca de Manaus, Estado do Amazonas.'
    );

    // ── Fecho ────────────────────────────────────────────────────
    doc
      .moveDown(0.4)
      .font('Helvetica').fontSize(10)
      .text(
        'Por estarem assim justos e acordados, firmam o presente instrumento, em duas vias de igual teor, ' +
        'juntamente com 2 (duas) testemunhas.',
        { align: 'justify' }
      )
      .moveDown(1);

    const dateStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Manaus, ${dateStr}.`).moveDown(2.5);

    // ── Assinaturas (3 colunas) ────────────────────────────────
    const lineWidth = 160;
    const col1 = margin;
    const col2 = margin + (pageW - margin * 2 - lineWidth) / 2;
    const col3 = pageW - margin - lineWidth;
    const sigY = doc.y;

    const drawSig = (x: number, label: string, name: string) => {
      doc
        .moveTo(x, sigY).lineTo(x + lineWidth, sigY).stroke()
        .font('Helvetica-Bold').fontSize(9)
        .text(name, x, sigY + 4, { width: lineWidth, align: 'center' })
        .font('Helvetica').fontSize(8)
        .text(label, x, sigY + 16, { width: lineWidth, align: 'center' });
    };

    drawSig(col1, 'Supervisor', fmt(volunteer.supervisor?.name, blank));
    drawSig(col2, 'Voluntário', volunteer.name);
    drawSig(col3, 'Representante Legal da Entidade', 'Rafael Veiga Paixão');

    // ── Notas de rodapé ──────────────────────────────────────────
    doc
      .moveDown(3)
      .font('Helvetica').fontSize(8)
      .text('Notas:', { underline: false })
      .text('1. Conforme o parágrafo único do art. 1º da Lei 9.608.')
      .text('2. O serviço voluntário encontra-se determinado no "caput" do art. 1º da Lei 9.608.')
      .text('3. Conforme o "caput" do art. 3º da Lei 9.608.');

    doc.end();
  });
}
