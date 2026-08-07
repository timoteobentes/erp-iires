import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Avatar, Row, Col, Select, Empty, notification } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { networkService, type NetworkPerson } from '../../services/network.service';

const STATUS_OPTIONS = [
  { label: 'Todos os Status', value: 'all' },
  { label: 'Apenas Ativos', value: 'ACTIVE' },
  { label: 'Apenas Inativos', value: 'INACTIVE' },
];

const ROLE_OPTIONS = [
  { label: 'Todos os Papéis', value: 'all' },
  { label: 'Doadores', value: 'DONOR' },
  { label: 'Parceiros / Fornecedores', value: 'PARTNER' },
];

const roleTag: Record<string, { text: string; className: string }> = {
  DONOR: { text: 'Doador', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  PARTNER: { text: 'Parceiro/Fornecedor', className: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  VOLUNTEER: { text: 'Voluntário', className: 'bg-green-50 text-green-600 border-green-200' },
};

function RoleTags({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => {
        const cfg = roleTag[r];
        if (!cfg) return null;
        return (
          <Tag key={r} className={`rounded-full font-bold text-[10px] px-2 border m-0 ${cfg.className}`}>
            {cfg.text}
          </Tag>
        );
      })}
    </div>
  );
}

export default function NetworkList() {
  const navigate = useNavigate();

  const [all, setAll] = useState<NetworkPerson[]>([]);
  const [filtered, setFiltered] = useState<NetworkPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await networkService.list();
      setAll(data);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar a rede de apoio.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(all.filter((p) => {
      const matchSearch = !term
        || p.name.toLowerCase().includes(term)
        || (p.email ?? '').toLowerCase().includes(term)
        || (p.document ?? '').includes(term);
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchRole = filterRole === 'all' || p.roles.includes(filterRole);
      return matchSearch && matchStatus && matchRole;
    }));
  }, [search, filterStatus, filterRole, all]);

  const handleInactivate = (id: string, name: string) => {
    Modal.confirm({
      title: 'Inativar registro',
      content: (
        <div>Tem certeza que deseja inativar <strong className="text-dark-900">{name}</strong>? O histórico é mantido.</div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await networkService.inactivate(id);
          notification.success({ message: 'Registro inativado com sucesso.' });
          setAll((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'INACTIVE' } : p)));
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar o registro.' });
        }
      },
    });
  };

  const columns: ColumnsType<NetworkPerson> = [
    {
      title: 'Nome',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(record.name)}&backgroundColor=009082`}
            className="border border-dark-100 shadow-sm font-bold"
          />
          <div>
            <p className="font-bold text-dark-900 leading-tight">{record.name}</p>
            <p className="text-xs text-dark-400 font-medium">{record.email ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Papéis',
      key: 'roles',
      render: (_, record) => <RoleTags roles={record.roles} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={`rounded-full font-bold uppercase text-[10px] px-3 border ${
          status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-dark-50 text-dark-400 border-dark-200'
        }`}>
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
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/people/network/${record.id}`)} className="text-dark-400 hover:text-secondary-500 transition-colors" />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/people/network/${record.id}/edit`)} className="text-dark-400 hover:text-primary-500 transition-colors" />
          </Tooltip>
          <Tooltip title={record.status === 'ACTIVE' ? 'Inativar' : 'Já Inativo'}>
            <Button
              type="text" icon={<Trash2 size={18} />}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Doadores & Parceiros</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Sua rede de apoio — a mesma pessoa pode ser doadora e parceira ao mesmo tempo.
          </p>
        </div>
        <Button
          type="primary" icon={<Plus size={18} />} size="large"
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/people/network/new')}
        >
          Novo Registro
        </Button>
      </div>

      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar por nome, e-mail ou documento..."
              prefix={<Search size={16} className="text-dark-300" />}
              className="rounded-xl w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            icon={showFilters ? <X size={18} /> : <Filter size={18} />}
            className={`flex items-center rounded-xl font-medium border-dark-200 h-[38px] ${showFilters ? 'bg-dark-50 text-dark-900' : 'text-dark-600'}`}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status</label>
                <Select className="w-full" value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Papel</label>
                <Select className="w-full" value={filterRole} onChange={setFilterRole} options={ROLE_OPTIONS} />
              </Col>
              <Col xs={24} sm={12} md={4} className="flex items-end">
                <Button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterRole('all'); }} className="w-full rounded-lg h-8 font-medium">
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150" bodyStyle={{ padding: 0 }}>
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: (
                <Empty description={
                  <span className="text-dark-400 font-medium">
                    {all.length === 0 ? 'Nenhum registro cadastrado ainda.' : 'Nenhum resultado para os filtros aplicados.'}
                  </span>
                } />
              ),
            }}
            pagination={{ pageSize: 15, showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registro${total !== 1 ? 's' : ''}` }}
          />
        </div>
      </Card>
    </div>
  );
}
