import { Button, Card, Tag, Row, Col, Avatar, Divider, Table, Space } from 'antd';
import { 
  ArrowLeft, 
  Edit,
  MapPin,
  TrendingUp,
  Plus,
  DollarSign
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DonorsView() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock do doador
  const donor = {
    id,
    name: 'TechCorp Brasil',
    type: 'Pessoa Jurídica',
    status: 'active',
    document: '12.345.678/0001-90',
    email: 'parcerias@techcorp.com.br',
    phone: '(11) 4002-8922',
    address: 'Av. Brigadeiro Faria Lima, 3000',
    city: 'São Paulo',
    state: 'SP',
    totalDonated: 120000,
    recurrence: 'Mensal',
    paymentMethod: 'Transferência Bancária',
    memberSince: '15/03/2023'
  };

  const recentDonations = [
    { id: '1', date: '10/04/2026', value: 10000, status: 'Pago' },
    { id: '2', date: '10/03/2026', value: 10000, status: 'Pago' },
    { id: '3', date: '10/02/2026', value: 10000, status: 'Pago' },
  ];

  // Função de atalho para o financeiro
  const handleNewDonation = () => {
    // No Padrão AmaDev, passamos o estado para o formulário de destino
    // O formulário de Recebíveis capturará esse "payer" e preencherá automaticamente
    navigate('/finance/receivables/new', { 
      state: { 
        payer: donor.name,
        categoryId: 'donation' // Já pré-seleciona a categoria de doação
      } 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Premium com Botão de Ação Financeira */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button 
            type="text" 
            icon={<ArrowLeft size={20} />} 
            onClick={() => navigate('/people/donors')} 
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all" 
          />
          <div className="flex items-center gap-5">
            <Avatar size={80} src={`https://api.dicebear.com/7.x/initials/svg?seed=${donor.name}&backgroundColor=0047AF`} className="border-2 border-white shadow-card font-bold text-2xl" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{donor.name}</h1>
                <Tag className="bg-green-50 text-green-600 border-green-200 font-bold px-3 py-0.5 rounded-full uppercase text-[10px]">Ativo</Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {donor.type} <Divider type="vertical" /> <span className="text-secondary-600 font-bold text-xs uppercase tracking-wider">{donor.recurrence}</span>
              </p>
            </div>
          </div>
        </div>
        
        <Space size="middle">
          {/* BOTÃO NOVO: Atalho para Doação */}
          <Button 
            type="primary" 
            icon={<DollarSign size={18} />} 
            onClick={handleNewDonation}
            className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Lançar Doação
          </Button>

          <Button 
            icon={<Edit size={18} />} 
            onClick={() => navigate(`/people/donors/${id}/edit`)} 
            className="border-dark-100 text-dark-600 hover:text-dark-900 rounded-xl font-bold px-6 h-11 flex items-center"
          >
            Editar Perfil
          </Button>
        </Space>
      </div>

      {/* Cards de Métricas (Mantidos) */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Total Doado (LTV)</p>
                <h3 className="text-2xl font-bold text-primary-600 leading-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(donor.totalDonated)}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600"><TrendingUp size={24} /></div>
            </div>
          </Card>
        </Col>
        {/* ... outros cards de métricas ... */}
      </Row>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        <Col xs={24} lg={8}>
          {/* Card de Contato (Mantido) */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-base font-bold text-dark-900 mb-6 flex items-center gap-2"><MapPin size={18} className="text-primary-500"/> Contato</h3>
            <div className="space-y-4">
              <div><p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Documento</p><p className="text-sm font-bold text-dark-900">{donor.document}</p></div>
              <div><p className="text-xs font-bold text-dark-400 uppercase tracking-widest">E-mail</p><p className="text-sm font-bold text-dark-900">{donor.email}</p></div>
              <div><p className="text-xs font-bold text-dark-400 uppercase tracking-widest">Telefone</p><p className="text-sm font-bold text-dark-900">{donor.phone}</p></div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {/* Card de Histórico Enriquecido */}
          <Card 
            className="rounded-2xl shadow-soft border-dark-100 h-full overflow-hidden" 
            bodyStyle={{ padding: 0 }} 
            title={<span className="font-bold text-dark-900 p-2 block">Histórico de Doações</span>}
            extra={
              <Button 
                type="text" 
                icon={<Plus size={16} />} 
                className="text-primary-600 font-bold flex items-center gap-1 hover:bg-primary-50"
                onClick={handleNewDonation}
              >
                Nova Doação
              </Button>
            }
          >
            <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5">
              <Table 
                dataSource={recentDonations} 
                rowKey="id" 
                pagination={false} 
                className="ant-table-premium"
                columns={[
                  { title: 'Data do Lançamento', dataIndex: 'date', className: 'font-medium' },
                  { title: 'Valor Recebido', dataIndex: 'value', render: (val) => <span className="font-bold text-primary-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span> },
                  { title: 'Status', dataIndex: 'status', render: (s) => <Tag color="success" className="rounded-full font-bold px-3">{s}</Tag> }
                ]} 
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}