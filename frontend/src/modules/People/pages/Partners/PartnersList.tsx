import { useState } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Dropdown } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, X, Handshake, LayoutGrid, List as ListIcon, MoreVertical, Briefcase, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface Partner {
  id: string;
  name: string;
  type: 'Parceiro' | 'Fornecedor';
  category: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

const mockData: Partner[] = [
  { id: '1', name: 'Universidade Federal', type: 'Parceiro', category: 'Educação', contactName: 'Prof. Roberto', email: 'contato@uf.edu.br', phone: '(11) 3000-1234', status: 'active' },
  { id: '2', name: 'Gráfica Rápida', type: 'Fornecedor', category: 'Marketing', contactName: 'Carlos Silva', email: 'vendas@grafica.com.br', phone: '(11) 98888-7777', status: 'active' },
  { id: '3', name: 'Tech Solutions AWS', type: 'Fornecedor', category: 'Tecnologia', contactName: 'Suporte', email: 'suporte@tech.com', phone: '0800 123 4567', status: 'inactive' },
];

export default function PartnersList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleDelete = (_id: string, name: string) => {
    Modal.confirm({
      title: 'Inativar Registro',
      content: (
        <div>
          Tem certeza que deseja inativar <strong className="text-dark-900">{name}</strong>?<br/>
          O histórico de contas a pagar e vínculos com projetos será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
    });
  };

  const columns: ColumnsType<Partner> = [
    {
      title: 'Empresa / Instituição',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={record.type === 'Fornecedor' ? <Building2 size={16} /> : <Briefcase size={16} />} 
            className={`${record.type === 'Fornecedor' ? 'bg-secondary-50 text-secondary-600' : 'bg-primary-50 text-primary-600'} border border-dark-100 shadow-sm`} 
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
              <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 m-0">{record.type}</Tag>
            </div>
            <p className="text-xs text-dark-400 font-medium">{record.category}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Contato Principal',
      key: 'contact',
      render: (_, record) => (
        <div>
          <p className="text-sm font-bold text-dark-700">{record.contactName}</p>
          <p className="text-xs text-dark-500">{record.email}</p>
        </div>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      className: 'font-medium text-dark-600',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
          status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-dark-50 text-dark-400 border-dark-200'
        }`}>
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Perfil"><Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/people/partners/${record.id}`)} className="text-dark-400 hover:text-secondary-500" /></Tooltip>
          <Tooltip title="Editar"><Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/people/partners/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500" /></Tooltip>
          <Tooltip title="Inativar"><Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.id, record.name)} className="text-dark-400 hover:text-red-500" /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          {/* <div className="h-12 w-12 bg-dark-50 rounded-2xl flex items-center justify-center text-dark-600 shadow-sm border border-dark-100">
            <Handshake size={24} />
          </div> */}
          <div>
            <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Parceiros & Fornecedores</h1>
            <p className="text-dark-400 text-sm mt-0.5">Gestão de fornecedores de serviços e instituições parceiras.</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large" 
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/people/partners/new')}
        >
          Novo Registro
        </Button>
      </div>

      {/* Controles: Busca e Filtros */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Input placeholder="Buscar por nome ou categoria..." prefix={<Search size={16} className="text-dark-300" />} className="rounded-xl w-full hover:border-secondary-400 focus:border-secondary-500 py-1.5" />
          </div>
          <div className="flex w-full md:w-auto gap-3 items-center">
            <Button onClick={() => setShowFilters(!showFilters)} icon={showFilters ? <X size={18} /> : <Filter size={18} />} className={`flex items-center rounded-xl font-medium border-dark-200 h-[38px] transition-colors ${showFilters ? 'bg-dark-50 text-dark-900' : 'text-dark-600'}`}>
              Filtros Avançados
            </Button>
            <div className="hidden sm:flex bg-dark-50 p-1 rounded-lg border border-dark-100 ml-2">
              <Button type="text" className={`p-1 h-auto w-auto rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'}`} onClick={() => setViewMode('list')}><ListIcon size={18} /></Button>
              <Button type="text" className={`p-1 h-auto w-auto rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></Button>
            </div>
          </div>
        </div>

        {/* Filtros Colapsáveis */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Tipo de Vínculo</label>
                <Select className="w-full" defaultValue="all" options={[{ label: 'Todos', value: 'all' }, { label: 'Apenas Fornecedores', value: 'fornecedor' }, { label: 'Apenas Parceiros', value: 'parceiro' }]} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status</label>
                <Select className="w-full" defaultValue="all" options={[{ label: 'Todos os Status', value: 'all' }, { label: 'Ativos', value: 'active' }, { label: 'Inativos', value: 'inactive' }]} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Categoria</label>
                <Select className="w-full" defaultValue="all" options={[{ label: 'Todas', value: 'all' }, { label: 'Educação', value: 'Educação' }, { label: 'Tecnologia', value: 'Tecnologia' }, { label: 'Marketing', value: 'Marketing' }]} />
              </Col>
              <Col xs={24} sm={12} md={4} className="flex items-end">
                <Button type="primary" className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg h-8 font-medium">Aplicar</Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Visão de Dados */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
            <Table columns={columns} dataSource={mockData} rowKey="id" pagination={{ pageSize: 10, className: "px-6 py-4 border-t border-dark-100 m-0", showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros` }} className="ant-table-premium [&_thead_th]:!bg-dark-50" />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {mockData.map((item) => (
              <Col xs={24} sm={12} xl={8} key={item.id}>
                <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group" bodyStyle={{ padding: '24px' }}>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown menu={{ items: [
                      { key: 'view', label: 'Ver Perfil', icon: <Eye size={16} />, onClick: () => navigate(`/people/partners/${item.id}`) },
                      { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => navigate(`/people/partners/${item.id}/edit`) },
                      { type: 'divider' },
                      { key: 'delete', label: 'Inativar', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(item.id, item.name) },
                    ] }} trigger={['click']}>
                      <Button type="text" icon={<MoreVertical size={18} />} className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-lg" />
                    </Dropdown>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Avatar icon={item.type === 'Fornecedor' ? <Building2 size={20} /> : <Briefcase size={20} />} size={48} className={`${item.type === 'Fornecedor' ? 'bg-secondary-50 text-secondary-600' : 'bg-primary-50 text-primary-600'} border border-dark-100`} />
                    <div>
                      <Tag className={`rounded-full font-bold uppercase text-[9px] px-2 border m-0 ${item.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-dark-50 text-dark-400 border-dark-200'}`}>
                        {item.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Tag>
                      <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 ml-1">{item.type}</Tag>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-dark-900 leading-tight mb-1 pr-6">{item.name}</h3>
                  <p className="text-xs font-bold text-dark-400 mb-4">{item.category}</p>
                  
                  <div className="mt-auto pt-4 border-t border-dark-50">
                    <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Contato</p>
                    <p className="text-sm font-bold text-dark-900">{item.contactName}</p>
                    <p className="text-xs font-medium text-dark-500">{item.email}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}