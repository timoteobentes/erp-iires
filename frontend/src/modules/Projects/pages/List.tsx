import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Space, Avatar, Tooltip, Card, Select, Row, Col, Dropdown, Tag, Empty, notification } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, LayoutGrid, List as ListIcon, MoreVertical, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { projectsService, type Project } from '../services/projects.service';

// ============================================================
// HELPERS
// ============================================================

const statusConfig: Record<string, { text: string; classes: string }> = {
  active: { text: 'Em Andamento', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  planning: { text: 'Planejamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { text: 'Concluído', classes: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  blocked: { text: 'Bloqueado', classes: 'bg-red-50 text-red-600 border-red-200' },
  draft: { text: 'Rascunho', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
  canceled: { text: 'Cancelado', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca projetos da API
  // --------------------------------------------------------
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectsService.list();
      setProjects(data);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar os projetos.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // --------------------------------------------------------
  // Filtros client-side
  // --------------------------------------------------------
  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.manager?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // --------------------------------------------------------
  // Deletar / arquivar projeto
  // --------------------------------------------------------
  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Arquivar Projeto',
      content: (
        <div>
          Tem certeza que deseja arquivar o projeto{' '}
          <strong className="text-dark-900">{name}</strong>?
        </div>
      ),
      okText: 'Sim, cancelar',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: async () => {
        try {
          await projectsService.changeStatus(id, 'canceled');
          setProjects((prev) => prev.filter((p) => p.id !== id));
          notification.success({ message: 'Projeto cancelado com sucesso.' });
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível cancelar o projeto.' });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Colunas da tabela
  // --------------------------------------------------------
  const columns: ColumnsType<Project> = [
    {
      title: 'Nome do Projeto',
      key: 'name',
      render: (_, record) => (
        <div>
          <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
          {record.description && (
            <p className="text-xs text-dark-400 font-medium mt-0.5 truncate max-w-xs">{record.description}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Responsável',
      key: 'manager',
      render: (_, record) => <span className="text-dark-600 font-medium">{record.manager?.name ?? '—'}</span>,
    },
    {
      title: 'Início',
      key: 'startDate',
      render: (_, record) => (
        <span className="text-dark-500 font-medium">{formatDate(record.startDate)}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const cfg = statusConfig[record.status] ?? { text: record.status, classes: 'bg-dark-50 text-dark-400 border-dark-200' };
        return (
          <Tag className={`px-3 py-0.5 rounded-full border font-bold uppercase text-[10px] ${cfg.classes}`}>
            {cfg.text}
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
          <Tooltip title="Visualizar Detalhes">
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/projects/${record.id}`)} className="text-dark-400 hover:text-secondary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Editar Projeto">
            <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/projects/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Arquivar">
            <Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.id, record.name)} className="text-dark-400 hover:text-red-500 transition-colors" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filtros e Busca */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Input
              placeholder="Buscar projetos por nome ou responsável..."
              prefix={<Search size={16} className="text-dark-300" />}
              className="rounded-xl w-full hover:border-secondary-400 focus:border-secondary-500 py-1.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status</label>
                <Select
                  className="w-full"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Todos os Status' },
                    { value: 'active', label: 'Em Andamento' },
                    { value: 'planning', label: 'Planejamento' },
                    { value: 'completed', label: 'Concluídos' },
                    { value: 'blocked', label: 'Bloqueados' },
                    { value: 'draft', label: 'Rascunhos' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6} className="flex items-end">
                <Button
                  type="primary"
                  className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg"
                  onClick={() => { setSearch(''); setStatusFilter('all'); }}
                >
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Conteúdo */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
            <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
              <Table
                columns={columns}
                dataSource={filtered}
                rowKey="id"
                loading={loading}
                locale={{ emptyText: <Empty description="Nenhum projeto encontrado" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                pagination={{
                  pageSize: 10,
                  className: 'px-6 py-4 border-t border-dark-100 m-0',
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} projetos`,
                }}
                className="ant-table-premium"
              />
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filtered.length === 0 && !loading ? (
              <Col span={24}>
                <Card className="rounded-2xl shadow-soft border-dark-100 text-center py-12">
                  <Empty description="Nenhum projeto encontrado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </Card>
              </Col>
            ) : (
              filtered.map((project) => {
                const cfg = statusConfig[project.status] ?? { text: project.status, classes: 'bg-dark-50 text-dark-400 border-dark-200' };
                return (
                  <Col xs={24} sm={12} xl={8} key={project.id}>
                    <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown menu={{
                          items: [
                            { key: 'view', label: 'Visualizar', icon: <Eye size={16} />, onClick: () => navigate(`/projects/${project.id}`) },
                            { key: 'edit', label: 'Editar', icon: <Edit size={16} />, onClick: () => navigate(`/projects/${project.id}/edit`) },
                            { type: 'divider' },
                            { key: 'delete', label: 'Arquivar', icon: <Trash2 size={16} />, danger: true, onClick: () => handleDelete(project.id, project.name) },
                          ],
                        }} trigger={['click']}>
                          <Button type="text" icon={<MoreVertical size={18} />} className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-lg" />
                        </Dropdown>
                      </div>
                      <div className="mb-4 pr-10">
                        <h3 className="text-lg font-bold text-dark-900 leading-tight mb-1">{project.name}</h3>
                        <p className="text-sm font-medium text-dark-400">
                          {project.manager ? `Gerido por ${project.manager.name}` : 'Sem responsável'}
                        </p>
                      </div>
                      <div className="mb-4">
                        <Tag className={`px-3 py-0.5 rounded-full border font-bold uppercase text-[10px] ${cfg.classes}`}>
                          {cfg.text}
                        </Tag>
                      </div>
                      <div className="mt-auto pt-4 border-t border-dark-100 flex justify-between items-center">
                        <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                          {(project.volunteers ?? []).map((v) => (
                            <Tooltip title={v.name} key={v.id}>
                              <Avatar src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.name)}`} />
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                        <div className="text-right">
                          <span className="text-xs font-medium text-dark-400 block">Início</span>
                          <span className="text-sm font-bold text-dark-900">{formatDate(project.startDate)}</span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })
            )}
          </Row>
        )}
      </div>
    </div>
  );
}
