import { useState } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  group: 'Administrador' | 'Financeiro' | 'Comercial' | 'Tecnologia' | 'Inovação';
  level: 'Diretor' | 'Líder' | 'Operacional' | 'Voluntário';
  status: 'active' | 'inactive';
}

const mockData: TeamMember[] = [
  { id: '1', name: 'Timóteo Bentes', email: 'timoteo@iires.org', role: 'Analista TI Jr', group: 'Tecnologia', level: 'Operacional', status: 'active' },
  { id: '2', name: 'Ana Silva', email: 'ana.silva@iires.org', role: 'Gerente de Projetos', group: 'Administrador', level: 'Líder', status: 'active' },
  { id: '3', name: 'Marcos Oliveira', email: 'marcos@iires.org', role: 'Analista Financeiro', group: 'Financeiro', level: 'Operacional', status: 'active' },
  { id: '4', name: 'Carla Dias', email: 'carla@iires.org', role: 'Coordenadora de Projetos', group: 'Comercial', level: 'Líder', status: 'active' },
  { id: '5', name: 'Beto Gomes', email: 'beto@iires.org', role: 'Designer', group: 'Inovação', level: 'Operacional', status: 'inactive' },
];

export default function TeamList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (name: string) => {
    Modal.confirm({
      title: 'Remover Membro da Equipe',
      content: (
        <div>
          Tem certeza que deseja remover <strong className="text-dark-900">{name}</strong>?<br/>
          Ele perderá acesso imediato ao sistema e não poderá mais realizar login.
        </div>
      ),
      centered: true,
      okText: 'Sim, remover acesso',
      okType: 'danger',
      cancelText: 'Cancelar',
    });
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Colaborador',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.name}`} className="border border-dark-100 shadow-sm" />
          <div>
            <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
            <p className="text-xs text-dark-400 font-medium mt-0.5">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Cargo / Nível',
      key: 'role',
      render: (_, record) => (
        <div>
          <p className="text-sm font-bold text-dark-700">{record.role}</p>
          <span className="text-[10px] uppercase font-bold text-dark-400 tracking-wider">{record.level}</span>
        </div>
      ),
    },
    {
      title: 'Grupo de Acesso',
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => {
        // Dicionário de Cores Premium (Padrão AmaDev)
        const colorMap: Record<string, string> = {
          'Administrador': 'bg-primary-50 text-primary-600 border-primary-200', // Verde
          'Tecnologia': 'bg-secondary-50 text-secondary-600 border-secondary-200', // Azul
          'Financeiro': 'bg-yellow-50 text-warning border-yellow-200', // Amarelo
          'Comercial': 'bg-purple-50 text-purple-600 border-purple-200', // Roxo
          'Inovação': 'bg-teal-50 text-teal-600 border-teal-200', // Verde Água
        };
        
        const classes = colorMap[group] || 'bg-dark-50 text-dark-500 border-dark-200';
        
        return (
          <Tag className={`rounded-lg border font-bold px-3 py-1 ${classes}`}>
            {group}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
          status === 'active' 
            ? 'bg-green-50 text-green-600 border-green-200' 
            : 'bg-dark-50 text-dark-400 border-dark-200'
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
          <Tooltip title="Ver Perfil">
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/people/team/${record.id}`)} className="text-dark-400 hover:text-secondary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Editar Acessos">
            <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/people/team/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Remover">
            <Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.name)} className="text-dark-400 hover:text-red-500 transition-colors" />
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
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Equipe Interna</h1>
          <p className="text-dark-400 text-sm mt-1">Gestão de colaboradores, cargos e permissões de acesso.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large" 
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/people/team/new')}
        >
          Novo Funcionário
        </Button>
      </div>

      {/* Card de Filtros e Busca */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Input 
              placeholder="Buscar por nome, e-mail ou cargo..." 
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
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status do Acesso</label>
                <Select className="w-full" defaultValue="all" options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Apenas Ativos' },
                  { value: 'inactive', label: 'Apenas Inativos' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Grupo de Acesso</label>
                <Select className="w-full" defaultValue="all" options={[
                  { value: 'all', label: 'Todos os Grupos' },
                  { value: 'admin', label: 'Administrador' },
                  { value: 'tecnologia', label: 'Tecnologia' },
                  { value: 'financeiro', label: 'Financeiro' },
                  { value: 'comercial', label: 'Comercial' },
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
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} colaboradores`
            }} 
            className="ant-table-premium" 
          />
        </div>
      </Card>
    </div>
  );
}