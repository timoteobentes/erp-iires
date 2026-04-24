import { Button, Card, Tag, Row, Col, Avatar, Divider, Table, Space } from 'antd';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase,
  Globe,
  User,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PartnersView() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock rico de dados
  const partner = {
    id,
    name: 'Tech Solutions AWS',
    type: 'Fornecedor', // ou 'Parceiro'
    personType: 'PJ',
    status: 'active',
    category: 'Tecnologia / Cloud',
    document: '27.865.757/0001-02',
    contactName: 'Carlos Oliveira',
    email: 'financeiro@techsolutions.com',
    phone: '(11) 4002-8922',
    website: 'www.techsolutions.com',
    address: 'Av. das Nações Unidas',
    number: '12901',
    neighborhood: 'Brooklin',
    city: 'São Paulo',
    state: 'SP',
    cep: '04578-000',
    totalValue: 45200.50, // Se for fornecedor: Total pago | Se for parceiro: Valor investido/cedido
    linkedItemsCount: 5, // Projetos ou Contas
    memberSince: '12/05/2024'
  };

  // Histórico adaptável: Se fornecedor mostra Contas, se parceiro mostra Projetos
  const historyData = [
    { id: '1', label: 'Serviço de Nuvem - Março', date: '10/03/2026', value: 450.00, status: 'Pago' },
    { id: '2', label: 'Implementação de Servidor', date: '15/02/2026', value: 12000.00, status: 'Pago' },
    { id: '3', label: 'Consultoria Mensal', date: '01/02/2026', value: 2500.00, status: 'Pago' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header do Perfil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button 
            type="text" 
            icon={<ArrowLeft size={20} />} 
            onClick={() => navigate('/people/partners')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar 
              size={80} 
              icon={partner.type === 'Fornecedor' ? <Building2 size={40} /> : <Briefcase size={40} />} 
              className={`${partner.type === 'Fornecedor' ? 'bg-secondary-50 text-secondary-600' : 'bg-primary-50 text-primary-600'} border-2 border-white shadow-card`}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{partner.name}</h1>
                <Tag className="bg-green-50 text-green-600 border-green-200 font-bold px-3 py-0.5 rounded-full uppercase text-[10px]">
                  Ativo
                </Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {partner.category} <Divider type="vertical" /> <span className="text-dark-600 font-bold uppercase text-xs tracking-wider">{partner.type}</span>
              </p>
            </div>
          </div>
        </div>
        <Space>
           {/* Atalho Inteligente: Se for fornecedor, botão para nova conta a pagar */}
           {partner.type === 'Fornecedor' && (
             <Button 
              icon={<DollarSign size={18} />} 
              className="bg-white text-dark-700 border-dark-200 hover:border-primary-500 hover:text-primary-600 rounded-xl font-bold shadow-soft h-11"
              onClick={() => navigate('/finance/payables/new', { state: { provider: partner.name }})}
            >
              Lançar Despesa
            </Button>
           )}
          <Button 
            type="primary" 
            icon={<Edit size={18} />} 
            onClick={() => navigate(`/people/partners/${id}/edit`)}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Editar Registro
          </Button>
        </Space>
      </div>

      {/* Cards de Métricas Rápidas */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '24px' }}>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Volume de Negócios</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-dark-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partner.totalValue)}</h3>
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><DollarSign size={20}/></div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '24px' }}>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">{partner.type === 'Fornecedor' ? 'Contas Lançadas' : 'Projetos Vinculados'}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-dark-900">{partner.linkedItemsCount} registros</h3>
              <div className="h-10 w-10 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-600"><FileText size={20}/></div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '24px' }}>
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Parceiro desde</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-dark-900">{partner.memberSince}</h3>
              <div className="h-10 w-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-600"><Calendar size={20}/></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Grid Principal */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        
        {/* Coluna Lateral: Dados e Contato */}
        <Col xs={24} lg={8} className="space-y-6">
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest mb-6">Dados Institucionais</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <User size={18} className="text-dark-300 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase">Responsável</p>
                  <p className="text-sm font-bold text-dark-900">{partner.contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-dark-300 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase">E-mail</p>
                  <p className="text-sm font-bold text-dark-900 lowercase">{partner.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-dark-300 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase">Telefone</p>
                  <p className="text-sm font-bold text-dark-900">{partner.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={18} className="text-dark-300 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase">Website</p>
                  <p className="text-sm font-bold text-secondary-600">{partner.website}</p>
                </div>
              </div>
            </div>
            
            <Divider className="my-6 border-dark-50" />
            
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-dark-300 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase">Localização</p>
                <p className="text-sm font-bold text-dark-900 leading-snug">
                  {partner.address}, {partner.number}<br />
                  {partner.neighborhood} - {partner.city}/{partner.state}<br />
                  {partner.cep}
                </p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Coluna Principal: Histórico */}
        <Col xs={24} lg={16}>
          <Card 
            className="rounded-2xl shadow-soft border-dark-100 overflow-hidden h-full" 
            bodyStyle={{ padding: 0 }}
            title={<span className="font-bold text-dark-900 p-2 block">{partner.type === 'Fornecedor' ? 'Últimos Pagamentos' : 'Projetos de Parceria'}</span>}
          >
            <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5">
              <Table 
                dataSource={historyData} 
                rowKey="id" 
                pagination={false} 
                className="ant-table-premium"
                columns={[
                  { title: 'Descrição', dataIndex: 'label', className: 'font-medium text-dark-900' },
                  { title: 'Data', dataIndex: 'date', className: 'text-dark-500' },
                  { 
                    title: 'Valor', 
                    dataIndex: 'value', 
                    align: 'right',
                    render: (val) => <span className="font-bold text-dark-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span> 
                  },
                  { 
                    title: 'Status', 
                    dataIndex: 'status', 
                    render: (s) => <Tag color="success" className="rounded-full font-bold px-3 border-none">{s}</Tag> 
                  }
                ]} 
              />
            </div>
            <div className="p-4 text-center border-t border-dark-50">
              <Button type="link" className="text-secondary-600 font-bold">Ver Histórico Completo</Button>
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}