import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Dropdown, Empty, notification } from 'antd';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, X,
  LayoutGrid, List as ListIcon, Clock, Briefcase, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { volunteersService, type Volunteer } from '../../services/volunteers.service';

// ============================================================
// CONSTANTES DE FILTRO
// ============================================================

const AVAILABILITY_OPTIONS = [
  { label: 'Todos os Turnos', value: 'all' },
  { label: 'Manhã', value: 'Manhã' },
  { label: 'Tarde', value: 'Tarde' },
  { label: 'Noite', value: 'Noite' },
  { label: 'Flexível', value: 'Flexível' },
  { label: 'Final de Semana', value: 'Final de Semana' },
];

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Disponíveis', value: 'ACTIVE' },
  { label: 'Indisponíveis', value: 'INACTIVE' },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function VolunteersList() {
  const navigate = useNavigate();

  // Dados
  const [allVolunteers, setAllVolunteers] = useState<Volunteer[]>([]);
  const [filtered, setFiltered] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // --------------------------------------------------------
  // Busca inicial
  // --------------------------------------------------------
  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await volunteersService.list();
      setAllVolunteers(data);
      setFiltered(data);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar os voluntários.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  // --------------------------------------------------------
  // Filtro client-side
  // --------------------------------------------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const result = allVolunteers.filter((v) => {
      const matchSearch =
        !term ||
        v.name.toLowerCase().includes(term) ||
        (v.email ?? '').toLowerCase().includes(term) ||
        v.skills.some((s) => s.toLowerCase().includes(term));

      const matchStatus = filterStatus === 'all' || v.status === filterStatus;
      const matchAvailability =
        filterAvailability === 'all' || v.availability === filterAvailability;

      return matchSearch && matchStatus && matchAvailability;
    });
    setFiltered(result);
  }, [search, filterStatus, filterAvailability, allVolunteers]);

  // --------------------------------------------------------
  // Inativar voluntário
  // --------------------------------------------------------
  const handleInactivate = (id: string, name: string) => {
    Modal.confirm({
      title: 'Remover Voluntário',
      content: (
        <div>
          Tem certeza que deseja inativar o voluntário{' '}
          <strong className="text-dark-900">{name}</strong>?<br />
          O histórico de horas doadas será mantido, mas ele ficará inativo na base.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await volunteersService.inactivate(id);
          notification.success({ message: 'Voluntário inativado com sucesso.' });
          setAllVolunteers((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: 'INACTIVE' } : v)),
          );
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar o voluntário.' });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Colunas
  // --------------------------------------------------------
  const columns: ColumnsType<Volunteer> = [
    {
      title: 'Voluntário',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(record.name)}`}
            size="large"
            className="bg-primary-50 border border-dark-100"
          />
          <div>
            <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
            <p className="text-xs text-dark-400 font-medium">{record.email ?? '—'}</p>
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
          {(skills ?? []).map((skill) => (
            <Tag
              key={skill}
              className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[10px] font-bold px-2 uppercase tracking-wide m-0"
            >
              {skill}
            </Tag>
          ))}
          {(!skills || skills.length === 0) && (
            <span className="text-dark-400 text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      title: 'Disponibilidade',
      dataIndex: 'availability',
      key: 'availability',
      render: (v) => <span className="text-dark-600 font-medium">{v ?? '—'}</span>,
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
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
            status === 'ACTIVE'
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'bg-dark-50 text-dark-400 border-dark-200'
          }`}
        >
          {status === 'ACTIVE' ? 'Disponível' : 'Indisponível'}
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
              onClick={() => navigate(`/people/volunteers/${record.id}`)}
              className="text-dark-400 hover:text-secondary-500"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/people/volunteers/${record.id}/edit`)}
              className="text-dark-400 hover:text-primary-500"
            />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Inativar' : 'Já Inativo'}>
            <Button
              type="text"
              icon={<Trash2 size={18} />}
              disabled={record.status === 'INACTIVE'}
              onClick={() => handleInactivate(record.id, record.name)}
              className="text-dark-400 hover:text-red-500 disabled:opacity-30"
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
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Voluntários</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Gestão de talentos, horários e engajamento da rede.
          </p>
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
      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar por nome, e-mail ou habilidade..."
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

            <div className="hidden sm:flex bg-dark-50 p-1 rounded-lg border border-dark-100 ml-2">
              <Button
                type="text"
                className={`p-1 h-auto w-auto rounded-md ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'
                }`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </Button>
              <Button
                type="text"
                className={`p-1 h-auto w-auto rounded-md ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-dark-900' : 'text-dark-400'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros Colapsáveis */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">
                  Status
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
                  Disponibilidade
                </label>
                <Select
                  className="w-full"
                  value={filterAvailability}
                  onChange={setFilterAvailability}
                  options={AVAILABILITY_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8} className="flex items-end">
                <Button
                  onClick={() => {
                    setSearch('');
                    setFilterStatus('all');
                    setFilterAvailability('all');
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

      {/* Renderização Condicional: Tabela vs Grid */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          <Card
            className="rounded-2xl shadow-soft border-dark-100 overflow-hidden"
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
                          {allVolunteers.length === 0
                            ? 'Nenhum voluntário cadastrado ainda.'
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
                    `${range[0]}-${range[1]} de ${total} voluntário${total !== 1 ? 's' : ''}`,
                }}
                className="ant-table-premium"
              />
            </div>
          </Card>
        ) : (
          <>
            {filtered.length === 0 && !loading ? (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '48px 24px' }}>
                <Empty
                  description={
                    <span className="text-dark-400 font-medium">
                      {allVolunteers.length === 0
                        ? 'Nenhum voluntário cadastrado ainda.'
                        : 'Nenhum resultado para os filtros aplicados.'}
                    </span>
                  }
                />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {filtered.map((volunteer) => (
                  <Col xs={24} sm={12} xl={6} key={volunteer.id}>
                    <Card
                      className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group text-center"
                      bodyStyle={{ padding: '24px' }}
                    >
                      {/* Menu Hover Grid */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'view',
                                label: 'Ver Perfil',
                                icon: <Eye size={16} />,
                                onClick: () => navigate(`/people/volunteers/${volunteer.id}`),
                              },
                              {
                                key: 'edit',
                                label: 'Editar',
                                icon: <Edit size={16} />,
                                onClick: () =>
                                  navigate(`/people/volunteers/${volunteer.id}/edit`),
                              },
                              { type: 'divider' },
                              {
                                key: 'inactivate',
                                label: 'Inativar',
                                icon: <Trash2 size={16} />,
                                danger: true,
                                disabled: volunteer.status === 'INACTIVE',
                                onClick: () => handleInactivate(volunteer.id, volunteer.name),
                              },
                            ],
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            icon={<MoreVertical size={18} />}
                            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-lg"
                          />
                        </Dropdown>
                      </div>

                      {/* Status Indicator */}
                      <div
                        className={`absolute top-4 left-4 w-2.5 h-2.5 rounded-full ${
                          volunteer.status === 'ACTIVE' ? 'bg-green-500' : 'bg-dark-300'
                        }`}
                      />

                      <Avatar
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(volunteer.name)}`}
                        size={80}
                        className="mx-auto mb-4 border-2 border-white shadow-sm"
                      />
                      <h3 className="text-lg font-bold text-dark-900 leading-tight">
                        {volunteer.name}
                      </h3>
                      <p className="text-xs font-medium text-dark-400 mb-4">{volunteer.email ?? '—'}</p>

                      <div className="flex justify-center gap-1.5 flex-wrap mb-6">
                        {(volunteer.skills ?? []).map((skill) => (
                          <Tag
                            key={skill}
                            className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[10px] font-bold px-2 uppercase tracking-wide m-0"
                          >
                            {skill}
                          </Tag>
                        ))}
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-dark-50">
                        <div>
                          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                            Horas
                          </p>
                          <p className="text-sm font-bold text-primary-600">
                            {volunteer.hoursDonated}h
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                            Projetos
                          </p>
                          <p className="text-sm font-bold text-secondary-600">
                            {volunteer.activeProjects}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  );
}
