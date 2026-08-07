import { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Tag, Avatar, Space, Popconfirm, notification, Tooltip } from 'antd';
import { UserPlus, Search, Eye, Pencil, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { teamService, type TeamMember } from '../../services/team.service';
import { volunteersService, type Volunteer } from '../../services/volunteers.service';

// ─── Tipo unificado ──────────────────────────────────────────
export interface MemberRecord {
  id: string;
  name: string;
  kind: 'user' | 'volunteer';
  bondType: string;
  roleOrProfession?: string | null;
  group?: string | null;
  status: string;
}

const bondLabel: Record<string, { text: string; color: string }> = {
  CLT:       { text: 'CLT',       color: 'blue'   },
  Prestador: { text: 'Prestador', color: 'purple' },
  Voluntário:{ text: 'Voluntário',color: 'green'  },
  Estágio:   { text: 'Estágio',   color: 'orange' },
};

function toBadge(bond: string) {
  const cfg = bondLabel[bond] ?? { text: bond, color: 'default' };
  return <Tag color={cfg.color} className="rounded-full font-bold text-xs">{cfg.text}</Tag>;
}

function statusBadge(status: string) {
  return status === 'ACTIVE'
    ? <span className="inline-flex items-center gap-1 text-xs font-bold text-secondary-600"><span className="w-2 h-2 rounded-full bg-secondary-500 inline-block" /> Ativo</span>
    : <span className="inline-flex items-center gap-1 text-xs font-bold text-dark-400"><span className="w-2 h-2 rounded-full bg-dark-300 inline-block" /> Inativo</span>;
}

export default function MembersList() {
  const navigate = useNavigate();

  const [allMembers, setAllMembers]     = useState<MemberRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterBond, setFilterBond]     = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();

  const loadMembers = async () => {
    try {
      setLoading(true);
      const [teamData, volunteersData] = await Promise.all([
        teamService.list(),
        volunteersService.list(),
      ]);

      const users: MemberRecord[] = teamData.map((m: TeamMember) => ({
        id:               m.id,
        name:             m.name,
        kind:             'user',
        bondType:         m.bondType || 'CLT',
        roleOrProfession: m.role,
        group:            m.group,
        status:           m.status,
      }));

      const vols: MemberRecord[] = volunteersData.map((v: Volunteer) => ({
        id:               v.id,
        name:             v.name,
        kind:             'volunteer',
        bondType:         'Voluntário',
        roleOrProfession: v.profession,
        group:            null,
        status:           v.status,
      }));

      const combined = [...users, ...vols].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      setAllMembers(combined);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar os colaboradores.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const handleInactivate = async (record: MemberRecord) => {
    try {
      if (record.kind === 'user') {
        await teamService.inactivate(record.id);
      } else {
        await volunteersService.inactivate(record.id);
      }
      notification.success({ message: 'Sucesso', description: `${record.name} foi inativado.` });
      loadMembers();
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível inativar o colaborador.' });
    }
  };

  const filtered = allMembers.filter((m) => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.roleOrProfession ?? '').toLowerCase().includes(search.toLowerCase());
    const matchBond   = !filterBond   || m.bondType === filterBond;
    const matchStatus = !filterStatus || m.status   === filterStatus;
    return matchSearch && matchBond && matchStatus;
  });

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MemberRecord) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${record.kind === 'volunteer' ? '026B11' : '0047AF'}`}
            size={38}
            className="border border-dark-100 shadow-sm shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-dark-900 leading-tight">{name}</p>
            {record.roleOrProfession && (
              <p className="text-xs text-dark-400 font-medium">{record.roleOrProfession}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Vínculo',
      dataIndex: 'bondType',
      key: 'bondType',
      width: 120,
      render: (bond: string) => toBadge(bond),
    },
    {
      title: 'Grupo / Área',
      dataIndex: 'group',
      key: 'group',
      width: 160,
      render: (group: string | null, record: MemberRecord) =>
        group
          ? <span className="text-sm text-dark-600">{group}</span>
          : record.kind === 'volunteer'
            ? <span className="text-xs text-dark-400 italic">—</span>
            : <span className="text-xs text-dark-400 italic">—</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => statusBadge(s),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_: any, record: MemberRecord) => {
        const base = `/people/members/${record.kind}/${record.id}`;
        return (
          <Space size={4}>
            <Tooltip title="Visualizar">
              <Button
                type="text" size="small"
                icon={<Eye size={16} />}
                onClick={() => navigate(base)}
                className="text-dark-400 hover:text-primary-600 rounded-lg"
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                type="text" size="small"
                icon={<Pencil size={16} />}
                onClick={() => navigate(`${base}/edit`)}
                className="text-dark-400 hover:text-primary-600 rounded-lg"
              />
            </Tooltip>
            {record.status === 'ACTIVE' && (
              <Tooltip title="Inativar">
                <Popconfirm
                  title={`Inativar ${record.name}?`}
                  description="O acesso ao sistema será revogado."
                  okText="Sim, inativar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleInactivate(record)}
                >
                  <Button
                    type="text" size="small"
                    icon={<UserX size={16} />}
                    className="text-dark-400 hover:text-red-500 rounded-lg"
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Colaboradores</h1>
          <p className="text-dark-400 text-sm mt-0.5">
            Equipe interna, prestadores e voluntários
          </p>
        </div>
        <Button
          type="primary"
          icon={<UserPlus size={18} />}
          onClick={() => navigate('/people/members/new')}
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center px-5"
          size="large"
        >
          Novo Colaborador
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Input
          prefix={<Search size={16} className="text-dark-300" />}
          placeholder="Buscar por nome ou cargo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
          className="rounded-xl w-72"
        />
        <Select
          placeholder="Tipo de vínculo"
          allowClear
          size="large"
          className="rounded-xl w-44 [&_.ant-select-selector]:!rounded-xl"
          onChange={setFilterBond}
          options={[
            { value: 'CLT',        label: 'CLT' },
            { value: 'Prestador',  label: 'Prestador' },
            { value: 'Voluntário', label: 'Voluntário' },
            { value: 'Estágio',    label: 'Estágio' },
          ]}
        />
        <Select
          placeholder="Status"
          allowClear
          size="large"
          className="rounded-xl w-36 [&_.ant-select-selector]:!rounded-xl"
          onChange={setFilterStatus}
          options={[
            { value: 'ACTIVE',   label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
          ]}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-soft border border-dark-100 overflow-hidden">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `${t} colaboradores` }}
          rowClassName="hover:bg-dark-50 transition-colors"
          className="ant-table-borderless"
          locale={{ emptyText: 'Nenhum colaborador encontrado.' }}
        />
      </div>
    </div>
  );
}
