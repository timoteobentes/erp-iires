import { useState } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Select, Row, Col } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface Payable {
  id: string;
  description: string;
  provider: string;
  dueDate: string;
  value: number;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
}

const mockData: Payable[] = [
  { id: '1', description: 'Aluguel Sede', provider: 'Imobiliária Central', dueDate: '10/05/2026', value: 3200, status: 'pending', category: 'Operacional' },
  { id: '2', description: 'Serviços de Nuvem - AWS', provider: 'Amazon Web Services', dueDate: '05/05/2026', value: 450.50, status: 'paid', category: 'TI' },
  { id: '3', description: 'Compra de Notebooks', provider: 'Dell Brasil', dueDate: '25/04/2026', value: 8500, status: 'overdue', category: 'Equipamentos' },
];

export default function PayablesList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Modal de Exclusão Premium (Chama pelo nome)
  const handleDelete = (id: string, description: string) => {
    Modal.confirm({
      title: 'Excluir Conta',
      content: (
        <div>
          Tem certeza que deseja excluir o lançamento <strong className="text-dark-900">{description}</strong>?<br/>
          Esta ação apagará o registro do fluxo de caixa e não poderá ser desfeita.
        </div>
      ),
      okText: 'Sim, excluir conta',
      okType: 'danger',
      centered: true,
      cancelText: 'Cancelar',
      onOk: () => {
        console.log('Lançamento excluído:', id);
      },
    });
  };

  const columns: ColumnsType<Payable> = [
    {
      title: 'Descrição / Fornecedor',
      key: 'description',
      render: (_, record) => (
        <div>
          <p className="font-bold text-dark-900 leading-tight">{record.description}</p>
          <p className="text-xs text-dark-400 font-medium mt-0.5">{record.provider}</p>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag className="rounded-lg bg-dark-50 border-none text-dark-600 font-medium px-3">{cat}</Tag>
    },
    {
      title: 'Vencimento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      className: 'text-dark-500 font-medium',
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (val) => <span className="font-bold text-dark-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}</span>
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        const config = {
          paid: { text: 'Pago', classes: 'bg-primary-50 text-primary-600 border-primary-200', icon: <CheckCircle size={12} /> },
          pending: { text: 'Pendente', classes: 'bg-yellow-50 text-warning border-yellow-200', icon: <Calendar size={12} /> },
          overdue: { text: 'Atrasado', classes: 'bg-red-50 text-red-600 border-red-200', icon: <AlertTriangle size={12} /> },
        }[status as 'paid' | 'pending' | 'overdue'];
        return (
          <Tag className={`px-3 py-1 rounded-full border font-bold text-xs flex items-center justify-center gap-1.5 w-28 ${config.classes}`}>
            {config.icon} {config.text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalhes">
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/finance/payables/${record.id}`)} className="text-dark-400 hover:text-secondary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/finance/payables/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.id, record.description)} className="text-dark-400 hover:text-red-500 transition-colors" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Contas a Pagar</h1>
          <p className="text-dark-400 text-sm mt-1">Controle de obrigações, pagamentos e fornecedores.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large" 
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/finance/payables/new')}
        >
          Nova Conta
        </Button>
      </div>

      {/* Área de Filtros e Busca */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Input 
              placeholder="Buscar por descrição ou fornecedor..." 
              prefix={<Search size={16} className="text-dark-300" />} 
              className="rounded-xl w-full hover:border-secondary-400 focus:border-secondary-500 py-1.5" 
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-3 items-center">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              icon={showFilters ? <X size={18} /> : <Filter size={18} />} 
              className={`flex items-center rounded-xl font-medium border-dark-200 h-[38px] transition-colors ${showFilters ? 'bg-dark-50 text-dark-900' : 'text-dark-600 hover:!text-secondary-500 hover:!border-secondary-400'}`}
            >
              Filtros Avançados
            </Button>
          </div>
        </div>

        {/* Painel Colapsável de Filtros Avançados */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status do Pagamento</label>
                <Select className="w-full" defaultValue="all" options={[
                  { value: 'all', label: 'Todos os Status' },
                  { value: 'pending', label: 'Pendentes' },
                  { value: 'paid', label: 'Pagos' },
                  { value: 'overdue', label: 'Atrasados' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Categoria</label>
                <Select className="w-full" defaultValue="all" options={[
                  { value: 'all', label: 'Todas as Categorias' },
                  { value: 'operacional', label: 'Operacional' },
                  { value: 'projeto', label: 'Projetos (Geral)' },
                  { value: 'ti', label: 'TI / Equipamentos' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={8} className="flex items-end">
                <Button type="primary" className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg h-8 font-medium">
                  Aplicar Filtros
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150" bodyStyle={{ padding: 0 }}>
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table 
            columns={columns} 
            dataSource={mockData} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10,
              className: "px-6 py-4 border-t border-dark-100 m-0",
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} contas`
            }} 
            className="ant-table-premium" 
          />
        </div>
      </Card>
    </div>
  );
}