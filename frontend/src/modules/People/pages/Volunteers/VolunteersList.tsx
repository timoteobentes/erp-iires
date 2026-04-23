import { useState } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Dropdown } from 'antd';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, X,
  LayoutGrid, List as ListIcon, Clock, Briefcase, MoreVertical 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  availability: 'Manhã' | 'Tarde' | 'Noite' | 'Final de Semana';
  status: 'active' | 'inactive';
  hoursDonated: number;
  activeProjects: number;
}

const mockData: Volunteer[] = [
  { id: '1', name: 'Rodrigo Faro', email: 'rodrigo@email.com', skills: ['Educação', 'Artes'], availability: 'Tarde', status: 'active', hoursDonated: 120, activeProjects: 2 },
  { id: '2', name: 'Juliana Paes', email: 'juliana@email.com', skills: ['Saúde', 'Psicologia'], availability: 'Manhã', status: 'active', hoursDonated: 45, activeProjects: 1 },
  { id: '3', name: 'Marta Vieira', email: 'marta@esporte.com', skills: ['Esportes', 'Liderança'], availability: 'Final de Semana', status: 'inactive', hoursDonated: 300, activeProjects: 0 },
  { id: '4', name: 'Thiago Silva', email: 'thiago@tech.com', skills: ['TI', 'Liderança'], availability: 'Noite', status: 'active', hoursDonated: 80, activeProjects: 1 },
];

export default function VolunteersList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleDelete = (name: string) => {
    Modal.confirm({
      title: 'Remover Voluntário',
      content: (
        <div>
          Tem certeza que deseja remover o voluntário <strong className="text-dark-900">{name}</strong>?<br/>
          O histórico de horas doadas será mantido, mas ele ficará inativo na base.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
    });
  };

  const columns: ColumnsType<Volunteer> = [
    {
      title: 'Voluntário',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.id}`} size="large" className="bg-primary-50 border border-dark-100" />
          <div>
            <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
            <p className="text-xs text-dark-400 font-medium">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Áreas de Interesse',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <div className="flex gap-1.5 flex-wrap">
          {skills.map(skill => (
            <Tag key={skill} className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[10px] font-bold px-2 uppercase tracking-wide m-0">
              {skill}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Disponibilidade',
      dataIndex: 'availability',
      key: 'availability',
      className: 'text-dark-600 font-medium',
    },
    {
      title: 'Engajamento',
      key: 'engagement',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <Tooltip title="Horas Doadas">
            <div className="flex items-center gap-1 text-xs font-bold text-dark-500">
              <Clock size={14} className="text-primary-500" /> {record.hoursDonated}h
            </div>
          </Tooltip>
          <Tooltip title="Projetos Ativos">
            <div className="flex items-center gap-1 text-xs font-bold text-dark-500">
              <Briefcase size={14} className="text-secondary-500" /> {record.activeProjects}
            </div>
          </Tooltip>
        </div>
      )
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
          {status === 'active' ? 'Disponível' : 'Indisponível'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Perfil"><Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/people/volunteers/${record.id}`)} className="text-dark-400 hover:text-secondary-500" /></Tooltip>
          <Tooltip title="Editar"><Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/people/volunteers/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500" /></Tooltip>
          <Tooltip title="Excluir"><Button type="text" icon={<Trash2 size={18} onClick={() => handleDelete(record.name)} />} className="text-dark-400 hover:text-red-500" /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          {/* <div className="h-12 w-12 flex items-center justify-center text-primary-600">
            <Heart size={24} className="fill-primary-100" />
          </div> */}
          <div>
            <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Voluntários</h1>
            <p className="text-dark-400 text-sm mt-0.5">Gestão de talentos, horários e engajamento da rede.</p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large" 
          className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/people/volunteers/new')}
        >
          Novo Voluntário
        </Button>
      </div>

      {/* Controles: Busca, Filtros e Visão */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="w-full md:w-96 relative">
            <Input 
              placeholder="Buscar por nome ou habilidade..." 
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
            
            <div className="hidden sm:flex bg-dark-50 p-1 rounded-lg border border-dark-100 ml-2">
              <Button type="text" className={`p-1 h-auto w-auto rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'}`} onClick={() => setViewMode('list')}><ListIcon size={18} /></Button>
              <Button type="text" className={`p-1 h-auto w-auto rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></Button>
            </div>
          </div>
        </div>

        {/* Filtros Colapsáveis Inteligentes */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status</label>
                <Select className="w-full" defaultValue="all" options={[{label: 'Todos', value: 'all'}, {label: 'Disponíveis', value: 'active'}, {label: 'Indisponíveis', value: 'inactive'}]} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Disponibilidade</label>
                <Select className="w-full" placeholder="Turno" options={[{label: 'Manhã', value: 'm'}, {label: 'Tarde', value: 't'}, {label: 'Noite', value: 'n'}, {label: 'Final de Semana', value: 'fds'}]} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Habilidades (Múltiplo)</label>
                <Select mode="multiple" className="w-full" placeholder="Selecione as áreas" options={[{label: 'Educação', value: 'edu'}, {label: 'Artes', value: 'art'}, {label: 'Saúde', value: 'sau'}]} />
              </Col>
              <Col xs={24} sm={12} md={4} className="flex items-end">
                <Button type="primary" className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg h-8 font-medium">Filtrar</Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Renderização Condicional: Tabela vs Grid */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
            <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
              <Table columns={columns} dataSource={mockData} rowKey="id" pagination={{ pageSize: 10, className: "px-6 py-4 border-t border-dark-100 m-0", showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} voluntários` }} className="ant-table-premium" />
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {mockData.map((volunteer) => (
              <Col xs={24} sm={12} xl={6} key={volunteer.id}>
                <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group text-center" bodyStyle={{ padding: '24px' }}>
                  
                  {/* Menu Hover Grid */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown menu={{ items: [
                      { key: 'view', label: 'Ver Perfil', icon: <Eye size={16} />, onClick: () => navigate(`/people/volunteers/${volunteer.id}`) },
                      { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => navigate(`/people/volunteers/${volunteer.id}/edit`) },
                      { type: 'divider' },
                      { key: 'delete', label: 'Excluir', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(volunteer.name) },
                    ] }} trigger={['click']}>
                      <Button type="text" icon={<MoreVertical size={18} />} className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-lg" />
                    </Dropdown>
                  </div>

                  {/* Status Indicator */}
                  <div className={`absolute top-4 left-4 w-2.5 h-2.5 rounded-full ${volunteer.status === 'active' ? 'bg-green-500' : 'bg-dark-300'}`}></div>

                  <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${volunteer.id}`} size={80} className="mx-auto mb-4 border-2 border-white shadow-sm" />
                  <h3 className="text-lg font-bold text-dark-900 leading-tight">{volunteer.name}</h3>
                  <p className="text-xs font-medium text-dark-400 mb-4">{volunteer.email}</p>
                  
                  <div className="flex justify-center gap-1.5 flex-wrap mb-6">
                    {volunteer.skills.map(skill => (
                      <Tag key={skill} className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[10px] font-bold px-2 uppercase tracking-wide m-0">
                        {skill}
                      </Tag>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-dark-50">
                    <div>
                      <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Horas</p>
                      <p className="text-sm font-bold text-primary-600">{volunteer.hoursDonated}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Projetos</p>
                      <p className="text-sm font-bold text-secondary-600">{volunteer.activeProjects}</p>
                    </div>
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