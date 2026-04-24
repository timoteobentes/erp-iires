import { useState } from 'react';
import { Card, Row, Col, Button, Select, DatePicker, Divider, message, Modal, Input, Tag } from 'antd';
import { 
  FileText, 
  FileSpreadsheet, 
  Mail,
  Users, 
  Briefcase, 
  DollarSign, 
  ShieldAlert,
  Send,
  Calendar
} from 'lucide-react';

const { RangePicker } = DatePicker;

// Definição dos tipos de relatórios disponíveis no sistema
const reportCategories = [
  {
    key: 'finance',
    title: 'Financeiro',
    icon: <DollarSign size={20} />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    reports: [
      { id: 'fin_fluxo', name: 'Fluxo de Caixa Detalhado', desc: 'Entradas e saídas consolidadas por período.' },
      { id: 'fin_inadimplencia', name: 'Inadimplência e Atrasos', desc: 'Contas a receber e a pagar fora do prazo.' },
      { id: 'fin_doacoes', name: 'Histórico de Doações', desc: 'LTV e detalhamento de doações por Pessoa Física e Jurídica.' },
    ]
  },
  {
    key: 'people',
    title: 'Pessoas & Rede',
    icon: <Users size={20} />,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    reports: [
      { id: 'peo_equipe', name: 'Relatório da Equipe Interna', desc: 'Cargos, acessos e informações de contato da equipe.' },
      { id: 'peo_voluntarios', name: 'Engajamento de Voluntários', desc: 'Horas doadas, áreas de atuação e disponibilidade.' },
      { id: 'peo_parceiros', name: 'Diretório de Parceiros/Fornecedores', desc: 'Listagem completa de fornecedores e parceiros institucionais.' },
    ]
  },
  {
    key: 'projects',
    title: 'Projetos',
    icon: <Briefcase size={20} />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    reports: [
      { id: 'proj_status', name: 'Status Geral de Projetos', desc: 'Avanço, orçamento utilizado e prazos dos projetos ativos.' },
      { id: 'proj_impacto', name: 'Relatório de Impacto Social', desc: 'Métricas de pessoas atendidas e resultados alcançados.' },
    ]
  },
  {
    key: 'system',
    title: 'Sistema & Auditoria',
    icon: <ShieldAlert size={20} />,
    color: 'text-dark-600',
    bg: 'bg-dark-50',
    reports: [
      { id: 'sys_logs', name: 'Logs de Acesso', desc: 'Registro de entrada e saída de usuários no sistema.' },
      { id: 'sys_auditoria', name: 'Auditoria de Alterações', desc: 'Rastreio de quem criou, editou ou excluiu registros críticos.' },
    ]
  }
];

export default function ReportsDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(reportCategories[0].key);
  const [selectedReport, setSelectedReport] = useState(reportCategories[0].reports[0]);
  
  // Estados para o Modal de E-mail
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailFormat, setEmailFormat] = useState<'pdf' | 'excel'>('pdf');

  // Simulações de Exportação (Padrão AmaDev)
  const handleExportPDF = () => {
    const hide = message.loading('Gerando PDF detalhado...', 0);
    setTimeout(() => {
      hide();
      message.success(`Relatório "${selectedReport.name}" exportado em PDF com sucesso!`);
    }, 1500);
  };

  const handleExportExcel = () => {
    const hide = message.loading('Compilando dados para o Excel...', 0);
    setTimeout(() => {
      hide();
      message.success(`Planilha "${selectedReport.name}" baixada com sucesso!`);
    }, 1500);
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      message.error('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    setIsEmailModalOpen(false);
    const hide = message.loading('Disparando e-mail pelo servidor...', 0);
    setTimeout(() => {
      hide();
      message.success(`Relatório enviado para ${emailAddress} no formato ${emailFormat.toUpperCase()}!`);
      setEmailAddress('');
    }, 2000);
  };

  const currentCategoryData = reportCategories.find(c => c.key === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Premium */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* <div className="h-12 w-12 bg-dark-900 rounded-2xl flex items-center justify-center text-white shadow-soft">
          <BarChart3 size={24} />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Central de Relatórios</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gere, exporte e envie relatórios gerenciais e de auditoria.</p>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        
        {/* COLUNA ESQUERDA: Navegação de Módulos */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '16px' }}>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-4 px-2">Módulos do Sistema</p>
            <div className="space-y-2">
              {reportCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setSelectedReport(cat.reports[0]); // Seleciona o primeiro relatório da categoria automaticamente
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    selectedCategory === cat.key 
                      ? `${cat.bg} border border-[color:var(--tw-colors-${cat.color.split('-')[1]}-200)] shadow-sm` 
                      : 'hover:bg-dark-50 border border-transparent'
                  }`}
                >
                  <div className={`${selectedCategory === cat.key ? cat.color : 'text-dark-400'}`}>
                    {cat.icon}
                  </div>
                  <span className={`font-bold ${selectedCategory === cat.key ? 'text-dark-900' : 'text-dark-600'}`}>
                    {cat.title}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </Col>

        {/* COLUNA DIREITA: Configuração e Exportação */}
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full flex flex-col" bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header do Card Direito */}
            <div className="p-6 border-b border-dark-100">
              <div className="flex items-center gap-2 mb-2">
                <Tag className={`${currentCategoryData?.bg} ${currentCategoryData?.color} border-none font-bold uppercase tracking-wider text-[10px] px-2 m-0`}>
                  Módulo {currentCategoryData?.title}
                </Tag>
              </div>
              <h2 className="text-xl font-bold text-dark-900 mb-1">Selecione o Relatório</h2>
            </div>

            {/* Seleção do Relatório Específico */}
            <div className="p-6 flex-1">
              <Row gutter={[16, 16]}>
                {currentCategoryData?.reports.map(report => (
                  <Col span={24} key={report.id}>
                    <div 
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedReport.id === report.id 
                          ? 'border-dark-900 bg-dark-50/50' 
                          : 'border-dark-100 hover:border-dark-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold ${selectedReport.id === report.id ? 'text-dark-900' : 'text-dark-700'}`}>
                          {report.name}
                        </h3>
                        {selectedReport.id === report.id && <div className="h-2.5 w-2.5 rounded-full bg-dark-900" />}
                      </div>
                      <p className="text-sm text-dark-500">{report.desc}</p>
                    </div>
                  </Col>
                ))}
              </Row>

              <Divider className="my-8" />

              {/* Filtros Comuns a todos os relatórios */}
              <h3 className="text-base font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" /> Filtros de Exportação
              </h3>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Período de Análise</label>
                  <RangePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" placeholder={['Data Inicial', 'Data Final']} />
                </Col>
                <Col xs={24} md={12}>
                  <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status dos Registros</label>
                  <Select size="large" className="w-full rounded-xl [&_.ant-select-selector]:!rounded-xl" defaultValue="all" options={[
                    { value: 'all', label: 'Todos os Registros' },
                    { value: 'active', label: 'Apenas Ativos / Concluídos' },
                    { value: 'inactive', label: 'Apenas Inativos / Cancelados' },
                  ]} />
                </Col>
              </Row>
            </div>

            {/* Rodapé com Ações de Exportação */}
            <div className="p-6 bg-dark-50/50 border-t border-dark-100 flex flex-col sm:flex-row justify-end gap-3 mt-auto">
              <Button 
                size="large" 
                icon={<Mail size={18} />} 
                className="rounded-xl font-bold border-dark-200 text-dark-700 bg-white hover:text-dark-900"
                onClick={() => setIsEmailModalOpen(true)}
              >
                Enviar por E-mail
              </Button>
              <Button 
                size="large" 
                icon={<FileSpreadsheet size={18} />} 
                className="rounded-xl font-bold bg-[#107c41] hover:!bg-[#0c5e31] text-white border-none shadow-soft"
                onClick={handleExportExcel}
              >
                Exportar Excel
              </Button>
              <Button 
                size="large" 
                icon={<FileText size={18} />} 
                className="rounded-xl font-bold bg-[#E5252A] hover:!bg-[#b91c20] text-white border-none shadow-soft"
                onClick={handleExportPDF}
              >
                Gerar PDF
              </Button>
            </div>

          </Card>
        </Col>
      </Row>

      {/* Modal Premium para Disparo de E-mail */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-dark-900 pb-2">
            <Mail size={20} className="text-primary-500" />
            <span className="text-lg font-bold">Enviar Relatório por E-mail</span>
          </div>
        }
        open={isEmailModalOpen}
        onCancel={() => setIsEmailModalOpen(false)}
        footer={null}
        centered
        className="rounded-2xl"
      >
        <div className="space-y-6 pt-4">
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Relatório Selecionado</p>
            <p className="text-sm font-bold text-dark-900">{selectedReport.name}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">E-mail do Destinatário</label>
            <Input 
              size="large" 
              placeholder="diretoria@instituto.org" 
              className="rounded-xl"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              prefix={<Mail size={16} className="text-dark-300" />}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Formato do Anexo</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setEmailFormat('pdf')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-bold ${emailFormat === 'pdf' ? 'border-[#E5252A] bg-red-50 text-[#E5252A]' : 'border-dark-100 text-dark-400 hover:border-dark-200'}`}
              >
                <FileText size={18} /> PDF
              </button>
              <button 
                onClick={() => setEmailFormat('excel')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-bold ${emailFormat === 'excel' ? 'border-[#107c41] bg-green-50 text-[#107c41]' : 'border-dark-100 text-dark-400 hover:border-dark-200'}`}
              >
                <FileSpreadsheet size={18} /> Excel
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 mt-6">
            <Button size="large" onClick={() => setIsEmailModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button size="large" type="primary" onClick={handleSendEmail} icon={<Send size={18} />} className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft">
              Enviar Agora
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}