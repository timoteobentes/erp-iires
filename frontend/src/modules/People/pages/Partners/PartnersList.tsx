import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Dropdown, Empty, notification } from 'antd';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, X,
  LayoutGrid, List as ListIcon, MoreVertical, Briefcase, Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { partnersService, type Partner } from '../../services/partners.service';

// ============================================================
// CONSTANTES DE FILTRO
// ============================================================

const TYPE_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Apenas Fornecedores', value: 'Fornecedor' },
  { label: 'Apenas Parceiros', value: 'Parceiro' },
];

const STATUS_OPTIONS = [
  { label: 'Todos os Status', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
];

// ============================================================
// COMPONENTE
// ============================================================

export default function PartnersList() {
  const navigate = useNavigate();

  // Dados
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [filtered, setFiltered] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // --------------------------------------------------------
  // Busca inicial
  // --------------------------------------------------------
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await partnersService.list();
      setAllPartners(data);
      setFiltered(data);
    } catch {
      notification.error({
        message: 'Erro',
        description: 'Não foi possível carregar os parceiros e fornecedores.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // --------------------------------------------------------
  // Filtro client-side
  // --------------------------------------------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const result = allPartners.filter((p) => {
      const matchSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.contactName ?? '').toLowerCase().includes(term) ||
        (p.email ?? '').toLowerCase().includes(term);

      const matchType = filterType === 'all' || p.partnershipType === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
    setFiltered(result);
  }, [search, filterType, filterStatus, allPartners]);

  // --------------------------------------------------------
  // Inativar parceiro
  // --------------------------------------------------------
  const handleInactivate = (id: string, name: string) => {
    Modal.confirm({
      title: 'Inativar Registro',
      content: (
        <div>
          Tem certeza que deseja inativar{' '}
          <strong className="text-dark-900">{name}</strong>?<br />
          O histórico de contas a pagar e vínculos com projetos será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await partnersService.inactivate(id);
          notification.success({ message: 'Registro inativado com sucesso.' });
          setAllPartners((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'inactive' } : p)),
          );
        } catch {
          notification.error({
            message: 'Erro',
            description: 'Não foi possível inativar o registro.',
          });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Colunas
  // --------------------------------------------------------
  const columns: ColumnsType<Partner> = [
    {
      title: 'Empresa / Instituição',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={
              record.partnershipType === 'Fornecedor' ? (
                <Building2 size={16} />
              ) : (
                <Briefcase size={16} />
              )
            }
            className={`${
              record.partnershipType === 'Fornecedor'
                ? 'bg-secondary-50 text-secondary-600'
                : 'bg-primary-50 text-primary-600'
            } border border-dark-100 shadow-sm`}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
              <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 m-0">
                {record.partnershipType}
              </Tag>
            </div>
            <p className="text-xs text-dark-400 font-medium">{record.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Contato Principal',
      key: 'contact',
      render: (_, record) => (
        <div>
          <p className="text-sm font-bold text-dark-700">{record.contactName ?? '—'}</p>
          <p className="text-xs text-dark-500">{record.phone ?? '—'}</p>
        </div>
      ),
    },
    {
      title: 'CNPJ / Doc.',
      key: 'cnpj',
      render: (_, record) => {
        const d = record.cnpj?.replace(/\D/g, '') ?? '';
        const formatted =
          d.length === 14
            ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
            : record.cnpj;
        return <span className="font-medium text-dark-600 text-sm">{formatted || '—'}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
            status === 'active'
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'bg-dark-50 text-dark-400 border-dark-200'
          }`}
        >
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
            <Button
              type="text"
              icon={<Eye size={18} />}
              onClick={() => navigate(`/people/partners/${record.id}`)}
              className="text-dark-400 hover:text-secondary-500"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/people/partners/${record.id}/edit`)}
              className="text-dark-400 hover:text-primary-500"
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Inativar' : 'Já Inativo'}>
            <Button
              type="text"
              icon={<Trash2 size={18} />}
              disabled={record.status === 'inactive'}
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
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
            Parceiros & Fornecedores
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Gestão de fornecedores de serviços e instituições parceiras.
          </p>
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

      {/* Controles */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar por nome, contato ou e-mail..."
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
                showFilters ? 'bg-dark-50 text-dark-900' : 'text-dark-600'
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
                  Tipo de Vínculo
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
                  Status
                </label>
                <Select
                  className="w-full"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={STATUS_OPTIONS}
                />
              </Col>
              <Col xs={24} sm={12} md={8} className="flex items-end">
                <Button
                  onClick={() => {
                    setSearch('');
                    setFilterType('all');
                    setFilterStatus('all');
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

      {/* Visão de Dados */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {viewMode === 'list' ? (
          <Card
            className="rounded-2xl shadow-soft border-dark-100 overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
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
                        {allPartners.length === 0
                          ? 'Nenhum parceiro ou fornecedor cadastrado ainda.'
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
                  `${range[0]}-${range[1]} de ${total} registro${total !== 1 ? 's' : ''}`,
              }}
              className="ant-table-premium [&_thead_th]:!bg-dark-50"
            />
          </Card>
        ) : (
          <>
            {filtered.length === 0 && !loading ? (
              <Card
                className="rounded-2xl shadow-soft border-dark-100"
                bodyStyle={{ padding: '48px 24px' }}
              >
                <Empty
                  description={
                    <span className="text-dark-400 font-medium">
                      {allPartners.length === 0
                        ? 'Nenhum parceiro ou fornecedor cadastrado ainda.'
                        : 'Nenhum resultado para os filtros aplicados.'}
                    </span>
                  }
                />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {filtered.map((item) => (
                  <Col xs={24} sm={12} xl={8} key={item.id}>
                    <Card
                      className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-shadow h-full flex flex-col relative group"
                      bodyStyle={{ padding: '24px' }}
                    >
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'view',
                                label: 'Ver Perfil',
                                icon: <Eye size={16} />,
                                onClick: () => navigate(`/people/partners/${item.id}`),
                              },
                              {
                                key: 'edit',
                                label: 'Editar',
                                icon: <Edit size={16} />,
                                onClick: () => navigate(`/people/partners/${item.id}/edit`),
                              },
                              { type: 'divider' },
                              {
                                key: 'inactivate',
                                label: 'Inativar',
                                icon: <Trash2 size={16} />,
                                danger: true,
                                disabled: item.status === 'inactive',
                                onClick: () => handleInactivate(item.id, item.name),
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

                      <div className="flex items-center gap-3 mb-4">
                        <Avatar
                          icon={
                            item.partnershipType === 'Fornecedor' ? (
                              <Building2 size={20} />
                            ) : (
                              <Briefcase size={20} />
                            )
                          }
                          size={48}
                          className={`${
                            item.partnershipType === 'Fornecedor'
                              ? 'bg-secondary-50 text-secondary-600'
                              : 'bg-primary-50 text-primary-600'
                          } border border-dark-100`}
                        />
                        <div>
                          <Tag
                            className={`rounded-full font-bold uppercase text-[9px] px-2 border m-0 ${
                              item.status === 'active'
                                ? 'bg-green-50 text-green-600 border-green-200'
                                : 'bg-dark-50 text-dark-400 border-dark-200'
                            }`}
                          >
                            {item.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Tag>
                          <Tag className="text-[9px] font-bold px-1 py-0 border-dark-200 ml-1">
                            {item.partnershipType}
                          </Tag>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-dark-900 leading-tight mb-1 pr-6">
                        {item.name}
                      </h3>
                      <p className="text-xs font-bold text-dark-400 mb-4">{item.email ?? '—'}</p>

                      <div className="mt-auto pt-4 border-t border-dark-50">
                        <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">
                          Contato
                        </p>
                        <p className="text-sm font-bold text-dark-900">
                          {item.contactName ?? '—'}
                        </p>
                        <p className="text-xs font-medium text-dark-500">{item.phone ?? '—'}</p>
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
