import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, notification, Empty } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { teamService, type TeamMember } from '../../services/team.service';

// ============================================================
// CONSTANTES DE FILTRO
// ============================================================

const GROUP_OPTIONS = [
  { value: 'all', label: 'Todos os Grupos' },
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Inovação', label: 'Inovação' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ACTIVE', label: 'Apenas Ativos' },
  { value: 'INACTIVE', label: 'Apenas Inativos' },
];

const GROUP_COLORS: Record<string, string> = {
  Administrador: 'bg-primary-50 text-primary-600 border-primary-200',
  Tecnologia: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  Financeiro: 'bg-yellow-50 text-warning border-yellow-200',
  Comercial: 'bg-purple-50 text-purple-600 border-purple-200',
  Inovação: 'bg-teal-50 text-teal-600 border-teal-200',
};

// ============================================================
// COMPONENTE
// ============================================================

export default function TeamList() {
  const navigate = useNavigate();

  // Dados
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [filtered, setFiltered] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // --------------------------------------------------------
  // Busca inicial
  // --------------------------------------------------------
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamService.list();
      setAllMembers(data);
      setFiltered(data);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar a equipe.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --------------------------------------------------------
  // Filtro client-side (busca + status + grupo)
  // --------------------------------------------------------
  useEffect(() => {
    const term = search.toLowerCase();

    const result = allMembers.filter((m) => {
      const matchSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.role ?? '').toLowerCase().includes(term);

      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchGroup = filterGroup === 'all' || m.group === filterGroup;

      return matchSearch && matchStatus && matchGroup;
    });

    setFiltered(result);
  }, [search, filterStatus, filterGroup, allMembers]);

  // --------------------------------------------------------
  // Inativar membro
  // --------------------------------------------------------
  const handleInactivate = (id: string, name: string) => {
    Modal.confirm({
      title: 'Remover Acesso ao Sistema',
      content: (
        <div>
          Tem certeza que deseja inativar <strong className="text-dark-900">{name}</strong>?<br />
          O colaborador perderá o acesso imediato ao sistema, mas seu histórico será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, revogar acesso',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await teamService.inactivate(id);
          notification.success({ message: 'Acesso revogado com sucesso.' });
          // Atualiza status localmente (sem refetch completo)
          setAllMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: 'INACTIVE' } : m)),
          );
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar o colaborador.' });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Colunas
  // --------------------------------------------------------
  const columns: ColumnsType<TeamMember> = [
    {
      title: 'Colaborador',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(record.name)}`}
            className="border border-dark-100 shadow-sm"
          />
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
          <p className="text-sm font-bold text-dark-700">{record.role ?? '—'}</p>
          <span className="text-[10px] uppercase font-bold text-dark-400 tracking-wider">
            {record.level ?? '—'}
          </span>
        </div>
      ),
    },
    {
      title: 'Grupo de Acesso',
      dataIndex: 'group',
      key: 'group',
      render: (group: string) => {
        const classes = GROUP_COLORS[group] ?? 'bg-dark-50 text-dark-500 border-dark-200';
        return (
          <Tag className={`rounded-lg border font-bold px-3 py-1 ${classes}`}>
            {group ?? '—'}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
            status === 'ACTIVE'
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'bg-dark-50 text-dark-400 border-dark-200'
          }`}
        >
          {status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
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
            <Button
              type="text"
              icon={<Eye size={18} />}
              onClick={() => navigate(`/people/team/${record.id}`)}
              className="text-dark-400 hover:text-secondary-500 transition-colors"
            />
          </Tooltip>
          <Tooltip title="Editar Acessos">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/people/team/${record.id}/edit`)}
              className="text-dark-400 hover:text-primary-500 transition-colors"
            />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Revogar Acesso' : 'Já Inativo'}>
            <Button
              type="text"
              icon={<Trash2 size={18} />}
              disabled={record.status === 'INACTIVE'}
              onClick={() => handleInactivate(record.id, record.name)}
              className="text-dark-400 hover:text-red-500 transition-colors disabled:opacity-30"
            />
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

      {/* Barra de busca e filtros */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar por nome, e-mail ou cargo..."
              prefix={<Search size={16} className="text-dark-300" />}
              className="rounded-xl w-full hover:border-secondary-400 focus:border-secondary-500 py-1.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? <X size={18} /> : <Filter size={18} />}
              className={`flex items-center rounded-xl font-medium border-dark-200 h-[38px] transition-colors ${
                showFilters
                  ? 'bg-dark-50 text-dark-900'
                  : 'text-dark-600 hover:!text-secondary-500 hover:!border-secondary-400'
              }`}
            >
              Filtros Avançados
            </Button>
          </div>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">
                  Status do Acesso
                </label>
                <Select
                  className="w-full"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={STATUS_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">
                  Grupo de Acesso
                </label>
                <Select
                  className="w-full"
                  value={filterGroup}
                  onChange={setFilterGroup}
                  options={GROUP_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8} className="flex items-end">
                <Button
                  onClick={() => {
                    setSearch('');
                    setFilterStatus('all');
                    setFilterGroup('all');
                  }}
                  className="w-full rounded-lg h-8 font-medium"
                >
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150"
        bodyStyle={{ padding: 0 }}
      >
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span className="text-dark-400 font-medium">
                      {allMembers.length === 0
                        ? 'Nenhum colaborador cadastrado ainda.'
                        : 'Nenhum resultado para os filtros aplicados.'}
                    </span>
                  }
                />
              ),
            }}
            pagination={{
              pageSize: 10,
              className: 'px-6 py-4 border-t border-dark-100 m-0',
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} colaborador${total !== 1 ? 'es' : ''}`,
            }}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}
