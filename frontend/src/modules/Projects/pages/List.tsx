import { useState } from 'react';
import { Table, Button, Input, Modal, Space, Avatar, Tooltip, Card, Select, Row, Col, Dropdown } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, LayoutGrid, List as ListIcon, MoreVertical, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface Project {
  id: string;
  name: string;
  manager: string;
  team: string[];
  startDate: string;
  progress: number;
  budget: string;
  status: 'active' | 'completed' | 'blocked' | 'draft';
}

const mockData: Project[] = [
  { id: '1', name: 'Inovação Verde', manager: 'Ana Silva', team: ['Ana', 'Beto', 'Carla'], startDate: '10/01/2026', progress: 75, budget: 'R$ 150.000', status: 'active' },
  { id: '2', name: 'Educação Tech', manager: 'Carlos Mendes', team: ['Carlos', 'Diana'], startDate: '15/02/2026', progress: 100, budget: 'R$ 85.000', status: 'completed' },
  { id: '3', name: 'Água Limpa', manager: 'Mariana Costa', team: ['Mari', 'João', 'Pedro', 'Sofia'], startDate: '05/03/2026', progress: 30, budget: 'R$ 210.000', status: 'active' },
  { id: '4', name: 'Cultura Inclusiva', manager: 'João Pedro', team: ['João'], startDate: '22/04/2026', progress: 10, budget: 'R$ 90.000', status: 'blocked' },
  { id: '5', name: 'Horta Comunitária', manager: 'Beatriz Lima', team: ['Beatriz', 'Lucas'], startDate: '10/05/2026', progress: 0, budget: 'R$ 45.000', status: 'draft' },
];

export default function ProjectList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Excluir Projeto',
      content: (
        <div>
          Tem certeza que deseja excluir o projeto <strong className="text-dark-900">{name}</strong>?<br/>
          Esta ação removerá todos os dados atrelados e não pode ser desfeita.
        </div>
      ),
      okText: 'Sim, excluir projeto',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: () => {
        console.log('Excluído', id);
      },
    });
  };

  // Colunas da Tabela (Sem a coluna de Status!)
  const columns: ColumnsType<Project> = [
    {
      title: 'Nome do Projeto',
      dataIndex: 'name',
      key: 'name',
      className: 'font-bold text-dark-900',
    },
    {
      title: 'Responsável',
      dataIndex: 'manager',
      key: 'manager',
      className: 'text-dark-500 font-medium',
    },
    {
      title: 'Equipe',
      key: 'team',
      render: (_, record) => (
        <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}>
          {record.team.map((member, i) => (
            <Tooltip title={member} key={i} placement="top">
              <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`} />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'Progresso',
      key: 'progress',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 bg-dark-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                record.progress === 100 ? 'bg-secondary-500' : record.progress === 0 ? 'bg-dark-300' : record.progress < 20 ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${record.progress}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-dark-700 min-w-[35px] text-right">
            {record.progress}%
          </span>
        </div>
      ),
    },
    {
      title: 'Orçamento',
      dataIndex: 'budget',
      key: 'budget',
      className: 'text-dark-900 font-bold',
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Visualizar Detalhes">
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/projects/${record.id}`)} className="text-dark-400 hover:text-secondary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Editar Projeto">
            <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/projects/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Excluir">
            <Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.id, record.name)} className="text-dark-400 hover:text-red-500 transition-colors" />
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
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Projetos</h1>
          <p className="text-dark-400 text-sm mt-1">Gestão de iniciativas, equipes e acompanhamento de impacto.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large"
          className="bg-primary-500 hover:!bg-primary-600 border-none shadow-soft flex items-center rounded-xl font-bold"
          onClick={() => navigate('/projects/new')}
        >
          Novo Projeto
        </Button>
      </div>

      {/* Área de Controles: Busca Rápida + Toggle Filters + View Mode */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="w-full md:w-96 relative">
            <Input 
              placeholder="Buscar projetos por nome..." 
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
              <Button 
                type="text" 
                className={`p-1 h-auto w-auto rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400 hover:text-dark-600'}`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </Button>
              <Button 
                type="text" 
                className={`p-1 h-auto w-auto rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400 hover:text-dark-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Área Colapsável de Filtros Avançados */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status / Progresso</label>
                <Select className="w-full" defaultValue="all" options={[
                  { value: 'all', label: 'Todos os Status' },
                  { value: 'active', label: 'Em Andamento' },
                  { value: 'completed', label: 'Concluídos' },
                  { value: 'blocked', label: 'Bloqueados' },
                  { value: 'draft', label: 'Rascunhos' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Responsável</label>
                <Select className="w-full" placeholder="Selecione um responsável" options={[
                  { value: 'ana', label: 'Ana Silva' },
                  { value: 'carlos', label: 'Carlos Mendes' },
                  { value: 'mariana', label: 'Mariana Costa' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Orçamento Mínimo</label>
                <Select className="w-full" defaultValue="0" options={[
                  { value: '0', label: 'Qualquer valor' },
                  { value: '50', label: 'Acima de R$ 50.000' },
                  { value: '100', label: 'Acima de R$ 100.000' },
                ]} />
              </Col>
              <Col xs={24} sm={12} md={6} className="flex items-end">
                <Button type="primary" className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg">Aplicar Filtros</Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Renderização Condicional: Lista vs Grid */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          /* MODO LISTA (TABELA) */
          <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
            <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
              <Table 
                columns={columns} 
                dataSource={mockData} 
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  className: "px-6 py-4 border-t border-dark-100 m-0",
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} projetos`
                }}
                className="ant-table-premium"
              />
            </div>
          </Card>
        ) : (
          /* MODO GRID (CARDS) */
          <Row gutter={[24, 24]}>
            {mockData.map((project) => (
              <Col xs={24} sm={12} xl={8} key={project.id}>
                <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group">
                  
                  {/* Menu de Ações (Aparece no hover) */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown menu={{ items: [
                      { key: 'view', label: 'Visualizar', icon: <Eye size={16} />, onClick: () => navigate(`/projects/${project.id}`) },
                      { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => navigate(`/projects/${project.id}/edit`) },
                      { type: 'divider' },
                      { key: 'delete', label: 'Excluir', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(project.id, project.name) },
                    ] }} trigger={['click']}>
                      <Button type="text" icon={<MoreVertical size={18} />} className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-lg" />
                    </Dropdown>
                  </div>

                  {/* Header do Card */}
                  <div className="mb-6 pr-10">
                    <h3 className="text-lg font-bold text-dark-900 leading-tight mb-1">{project.name}</h3>
                    <p className="text-sm font-medium text-dark-400">Gerido por {project.manager}</p>
                  </div>

                  {/* Progresso */}
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-dark-500 uppercase tracking-wide">Progresso</span>
                      <span className="text-sm font-bold text-dark-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          project.progress === 100 ? 'bg-secondary-500' : project.progress === 0 ? 'bg-dark-300' : project.progress < 20 ? 'bg-red-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer do Card (Equipe e Orçamento) */}
                  <div className="mt-auto pt-4 border-t border-dark-100 flex justify-between items-center">
                    <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                      {project.team.map((member, i) => (
                        <Tooltip title={member} key={i}>
                          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`} />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                    <div className="text-right">
                      <span className="text-xs font-medium text-dark-400 block">Orçamento</span>
                      <span className="text-sm font-bold text-dark-900">{project.budget}</span>
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