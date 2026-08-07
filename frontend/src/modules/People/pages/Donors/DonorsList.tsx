import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Dropdown, Empty, notification } from 'antd';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, X,
  LayoutGrid, List as ListIcon, MoreVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { donorsService, type Donor } from '../../services/donors.service';

// ============================================================
// CONSTANTES DE FILTRO
// ============================================================

const STATUS_OPTIONS = [
  { label: 'Todos os Status', value: 'all' },
  { label: 'Apenas Ativos', value: 'ACTIVE' },
  { label: 'Apenas Inativos', value: 'INACTIVE' },
];

const TYPE_OPTIONS = [
  { label: 'Ambos (PF e PJ)', value: 'all' },
  { label: 'Pessoa Física (PF)', value: 'PF' },
  { label: 'Pessoa Jurídica (PJ)', value: 'PJ' },
];

const RECURRENCE_OPTIONS = [
  { label: 'Todas as Recorrências', value: 'all' },
  { label: 'Mensal', value: 'Mensal' },
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Anual', value: 'Anual' },
  { label: 'Doação Única', value: 'Unica' },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function DonorsList() {
  const navigate = useNavigate();

  // Dados
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [filtered, setFiltered] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRecurrence, setFilterRecurrence] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // --------------------------------------------------------
  // Busca inicial
  // --------------------------------------------------------
  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await donorsService.list();
      setAllDonors(data);
      setFiltered(data);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar os doadores.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // --------------------------------------------------------
  // Filtro client-side
  // --------------------------------------------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const result = allDonors.filter((d) => {
      const matchSearch =
        !term ||
        d.name.toLowerCase().includes(term) ||
        (d.email ?? '').toLowerCase().includes(term) ||
        (d.document ?? '').includes(term);

      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      const matchType = filterType === 'all' || d.type === filterType;
      const matchRecurrence = filterRecurrence === 'all' || d.recurrence === filterRecurrence;

      return matchSearch && matchStatus && matchType && matchRecurrence;
    });
    setFiltered(result);
  }, [search, filterStatus, filterType, filterRecurrence, allDonors]);

  // --------------------------------------------------------
  // Inativar doador
  // --------------------------------------------------------
  const handleInactivate = (id: string, name: string) => {
    Modal.confirm({
      title: 'Inativar Doador',
      content: (
        <div>
          Tem certeza que deseja inativar o doador{' '}
          <strong className="text-dark-900">{name}</strong>?<br />
          O histórico financeiro de doações passadas será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await donorsService.inactivate(id);
          notification.success({ message: 'Doador inativado com sucesso.' });
          setAllDonors((prev) =>
            prev.map((d) => (d.id === id ? { ...d, status: 'INACTIVE' } : d)),
          );
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar o doador.' });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Colunas
  // --------------------------------------------------------
  const columns: ColumnsType<Donor> = [
    {
      title: 'Doador / Empresa',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(record.name)}&backgroundColor=0047AF`}
            className="border border-dark-100 shadow-sm font-bold"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
              <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 m-0">
                {record.type}
              </Tag>
            </div>
            <p className="text-xs text-dark-400 font-medium">{record.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Recorrência',
      dataIndex: 'recurrence',
      key: 'recurrence',
      render: (recurrence) => (
        <Tag
          className={`rounded-md font-bold px-2 uppercase tracking-wide text-[10px] ${
            recurrence === 'Mensal'
              ? 'bg-primary-50 text-primary-600 border-none'
              : recurrence === 'Anual'
              ? 'bg-secondary-50 text-secondary-600 border-none'
              : 'bg-dark-50 text-dark-500 border-none'
          }`}
        >
          {recurrence ?? '—'}
        </Tag>
      ),
    },
    {
      title: 'Método de Pagamento',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (v) => <span className="text-dark-600 font-medium text-sm">{v ?? '—'}</span>,
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
              onClick={() => navigate(`/people/donors/${record.id}`)}
              className="text-dark-400 hover:text-secondary-500 transition-colors"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/people/donors/${record.id}/edit`)}
              className="text-dark-400 hover:text-primary-500 transition-colors"
            />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Inativar' : 'Já Inativo'}>
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
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Doadores</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Gestão de pessoas físicas, jurídicas e histórico de doações.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          size="large"
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/people/donors/new')}
        >
          Novo Doador
        </Button>
      </div>

      {/* Controles */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar por nome, e-mail ou documento..."
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
                className={`p-1 h-auto w-auto rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-dark-900'
                    : 'text-dark-400 hover:text-dark-600'
                }`}
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={18} />
              </Button>
              <Button
                type="text"
                className={`p-1 h-auto w-auto rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-dark-900'
                    : 'text-dark-400 hover:text-dark-600'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Painel Colapsável de Filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
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
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">
                  Tipo de Pessoa
                </label>
                <Select
                  className="w-full"
                  value={filterType}
                  onChange={setFilterType}
                  options={TYPE_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">
                  Recorrência
                </label>
                <Select
                  className="w-full"
                  value={filterRecurrence}
                  onChange={setFilterRecurrence}
                  options={RECURRENCE_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={4} className="flex items-end">
                <Button
                  onClick={() => {
                    setSearch('');
                    setFilterStatus('all');
                    setFilterType('all');
                    setFilterRecurrence('all');
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

      {/* Visões: Lista vs Cards */}
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
                          {allDonors.length === 0
                            ? 'Nenhum doador cadastrado ainda.'
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
                    `${range[0]}-${range[1]} de ${total} doador${total !== 1 ? 'es' : ''}`,
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
                      {allDonors.length === 0
                        ? 'Nenhum doador cadastrado ainda.'
                        : 'Nenhum resultado para os filtros aplicados.'}
                    </span>
                  }
                />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {filtered.map((donor) => (
                  <Col xs={24} sm={12} xl={8} key={donor.id}>
                    <Card
                      className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group"
                      bodyStyle={{ padding: '24px' }}
                    >
                      {/* Menu de Ações no Modo Grid */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'view',
                                label: 'Ver Perfil',
                                icon: <Eye size={16} />,
                                onClick: () => navigate(`/people/donors/${donor.id}`),
                              },
                              {
                                key: 'edit',
                                label: 'Editar',
                                icon: <Edit size={16} />,
                                onClick: () => navigate(`/people/donors/${donor.id}/edit`),
                              },
                              { type: 'divider' },
                              {
                                key: 'inactivate',
                                label: 'Inativar',
                                icon: <Trash2 size={16} />,
                                danger: true,
                                disabled: donor.status === 'INACTIVE',
                                onClick: () => handleInactivate(donor.id, donor.name),
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

                      <div className="flex justify-between items-start mb-4">
                        <Avatar
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(donor.name)}&backgroundColor=0047AF`}
                          size={56}
                          className="border border-dark-100"
                        />
                        <Tag
                          className={`rounded-full font-bold uppercase text-[9px] px-2 border m-0 ${
                            donor.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : 'bg-dark-50 text-dark-400 border-dark-200'
                          }`}
                        >
                          {donor.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Tag>
                      </div>

                      <div className="mb-4 pr-6">
                        <h3 className="text-lg font-bold text-dark-900 leading-tight mb-1 flex items-center gap-2">
                          {donor.name}
                          <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 m-0">
                            {donor.type}
                          </Tag>
                        </h3>
                        <p className="text-xs font-medium text-dark-400">{donor.email ?? '—'}</p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-dark-50 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">
                            Recorrência
                          </p>
                          <p className="text-base font-bold text-primary-600">
                            {donor.recurrence ?? '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">
                            Pagamento
                          </p>
                          <p className="text-sm font-bold text-dark-900">
                            {donor.paymentMethod ?? '—'}
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
