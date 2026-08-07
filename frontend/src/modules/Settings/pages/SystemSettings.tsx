import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Input, Form, Select, message, Table, Tag, Modal, Popconfirm, Tooltip, Empty } from 'antd';
import { Building2, ShieldCheck, Users, UserPlus, Trash2 } from 'lucide-react';
import { SESSION_TIMEOUT_KEY } from '../../../hooks/useInactivityTimer';
import { organizationService } from '../services/organization.service';
import { membershipsService, rolesService, type Membership, type Role } from '../services/memberships.service';
import { invitesService, type Invite } from '../services/invites.service';
import { usePermission } from '../../Auth/hooks/usePermission';

const LEGAL_NATURES = [
  { value: 'ASSOCIACAO', label: 'Associação' },
  { value: 'FUNDACAO', label: 'Fundação' },
  { value: 'INSTITUTO', label: 'Instituto' },
  { value: 'OSCIP', label: 'OSCIP' },
  { value: 'ORGANIZACAO_SOCIAL', label: 'Organização Social' },
  { value: 'COOPERATIVA', label: 'Cooperativa' },
  { value: 'EMPRESA_LTDA', label: 'Empresa Ltda.' },
  { value: 'EMPRESA_SA', label: 'Empresa S.A.' },
  { value: 'MEI', label: 'MEI' },
  { value: 'OUTRO', label: 'Outro' },
];

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();
  const { canManageSettings, can } = usePermission();
  const canManageMembers = can('org.members:manage');

  // ── Dados da instituição ────────────────────────────────────
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    organizationService.getMe()
      .then((org) => form.setFieldsValue(org))
      .catch(() => message.error('Não foi possível carregar os dados da organização.'))
      .finally(() => setLoadingOrg(false));
  }, [form]);

  const handleSaveOrg = async (values: any) => {
    try {
      await organizationService.updateMe(values);
      message.success('Dados da organização salvos com sucesso!');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleSaveSecurity = (values: any) => {
    if (values.sessionTimeout) {
      localStorage.setItem(SESSION_TIMEOUT_KEY, values.sessionTimeout);
    }
    message.success('Configurações salvas com sucesso!');
  };

  // ── Usuários & convites ──────────────────────────────────────
  const [members, setMembers] = useState<Membership[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm] = Form.useForm();

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const [m, i, r] = await Promise.all([membershipsService.list(), invitesService.list(), rolesService.list()]);
      setMembers(m);
      setInvites(i);
      setRoles(r);
    } catch {
      message.error('Não foi possível carregar os usuários.');
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') loadMembers();
  }, [activeTab]);

  const handleInvite = async (values: { email: string; roleId: string }) => {
    try {
      await invitesService.create(values.email, values.roleId);
      message.success('Convite enviado com sucesso!');
      setInviteOpen(false);
      inviteForm.resetFields();
      loadMembers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao enviar convite.');
    }
  };

  const handleRoleChange = async (membershipId: string, roleId: string) => {
    try {
      await membershipsService.updateRole(membershipId, roleId);
      message.success('Papel atualizado!');
      loadMembers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao atualizar papel.');
    }
  };

  const handleToggleStatus = async (membership: Membership) => {
    const nextStatus = membership.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await membershipsService.updateStatus(membership.id, nextStatus);
      message.success(nextStatus === 'ACTIVE' ? 'Acesso reativado.' : 'Acesso revogado.');
      loadMembers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao atualizar status.');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      await invitesService.revoke(id);
      message.success('Convite revogado.');
      loadMembers();
    } catch {
      message.error('Erro ao revogar convite.');
    }
  };

  const menuItems = [
    { key: 'general', icon: <Building2 size={20} />, label: 'Dados da Instituição', desc: 'Informações da organização' },
    { key: 'users', icon: <Users size={20} />, label: 'Usuários', desc: 'Convites, papéis e acessos' },
    { key: 'security', icon: <ShieldCheck size={20} />, label: 'Segurança & Acessos', desc: 'Regras de sessão' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Configurações</h1>
        <p className="text-dark-400 text-sm mt-0.5">Gerencie os dados, usuários e segurança da sua organização.</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" styles={{ body: { padding: '16px' } }}>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-4 px-2">Painel de Controle</p>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.key ? 'bg-primary-50 border border-primary-200 shadow-sm' : 'hover:bg-dark-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={activeTab === item.key ? 'text-primary-600' : 'text-dark-400'}>{item.icon}</div>
                    <span className={`font-bold ${activeTab === item.key ? 'text-primary-700' : 'text-dark-600'}`}>{item.label}</span>
                  </div>
                  <p className={`text-xs ml-8 ${activeTab === item.key ? 'text-primary-600/80' : 'text-dark-400'}`}>{item.desc}</p>
                </button>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {activeTab === 'general' && (
            <Card className="rounded-2xl shadow-soft border-dark-100" styles={{ body: { padding: 0 } }} loading={loadingOrg}>
              <Form form={form} layout="vertical" onFinish={handleSaveOrg} requiredMark={false}>
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Dados da Instituição</h2>
                  <p className="text-sm text-dark-500 mt-1">Essas informações aparecerão nos relatórios e documentos gerados.</p>
                </div>
                <div className="p-6">
                  <Row gutter={24}>
                    <Col xs={24} md={16}>
                      <Form.Item label={<span className="font-bold text-dark-600">Razão Social</span>} name="legalName">
                        <Input size="large" className="rounded-xl" disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<span className="font-bold text-dark-600">CNPJ</span>} name="document">
                        <Input size="large" className="rounded-xl" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Nome Fantasia</span>} name="tradeName">
                        <Input size="large" className="rounded-xl" disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Natureza Jurídica</span>} name="legalNature">
                        <Select size="large" className="rounded-xl" options={LEGAL_NATURES} disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">E-mail de Contato</span>} name="email">
                        <Input size="large" className="rounded-xl" disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Telefone</span>} name="phone">
                        <Input size="large" className="rounded-xl" disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label={<span className="font-bold text-dark-600">Website</span>} name="website">
                        <Input size="large" className="rounded-xl" disabled={!canManageSettings} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                {canManageSettings && (
                  <div className="p-6 bg-dark-50/50 border-t border-dark-100 flex justify-end">
                    <Button type="primary" htmlType="submit" size="large" className="rounded-xl font-bold shadow-soft px-8">
                      Salvar Configurações
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="rounded-2xl shadow-soft border-dark-100" styles={{ body: { padding: 0 } }} loading={loadingMembers}>
              <div className="p-6 border-b border-dark-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-dark-900">Usuários</h2>
                  <p className="text-sm text-dark-500 mt-1">Quem tem acesso a esta organização, e com qual papel.</p>
                </div>
                {canManageMembers && (
                  <Button type="primary" icon={<UserPlus size={16} />} className="rounded-xl font-bold" onClick={() => setInviteOpen(true)}>
                    Convidar
                  </Button>
                )}
              </div>

              <div className="p-6">
                <Table
                  rowKey="id"
                  dataSource={members}
                  pagination={false}
                  columns={[
                    {
                      title: 'Nome',
                      key: 'name',
                      render: (_, m) => (
                        <div>
                          <div className="font-semibold text-dark-900">{m.user.name}</div>
                          <div className="text-xs text-dark-400">{m.user.email}</div>
                        </div>
                      ),
                    },
                    {
                      title: 'Papel',
                      key: 'role',
                      render: (_, m) =>
                        m.isOwner ? (
                          <Tag color="gold">Dono da organização</Tag>
                        ) : canManageMembers ? (
                          <Select
                            size="small"
                            value={m.role.id}
                            className="min-w-[160px]"
                            options={roles.map((r) => ({ value: r.id, label: r.name }))}
                            onChange={(roleId) => handleRoleChange(m.id, roleId)}
                          />
                        ) : (
                          <Tag>{m.role.name}</Tag>
                        ),
                    },
                    {
                      title: 'Status',
                      key: 'status',
                      render: (_, m) => (
                        <Tag color={m.status === 'ACTIVE' ? 'green' : 'default'}>{m.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</Tag>
                      ),
                    },
                    {
                      title: 'Ações',
                      key: 'actions',
                      render: (_, m) =>
                        canManageMembers && !m.isOwner ? (
                          <Popconfirm
                            title={m.status === 'ACTIVE' ? 'Revogar o acesso deste usuário?' : 'Reativar o acesso deste usuário?'}
                            onConfirm={() => handleToggleStatus(m)}
                          >
                            <Button size="small" danger={m.status === 'ACTIVE'} className="rounded-lg">
                              {m.status === 'ACTIVE' ? 'Revogar acesso' : 'Reativar'}
                            </Button>
                          </Popconfirm>
                        ) : null,
                    },
                  ]}
                />

                {invites.length > 0 && (
                  <>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mt-8 mb-3">Convites pendentes</p>
                    <Table
                      rowKey="id"
                      dataSource={invites}
                      pagination={false}
                      size="small"
                      locale={{ emptyText: <Empty description="Nenhum convite pendente" /> }}
                      columns={[
                        { title: 'E-mail', dataIndex: 'email' },
                        { title: 'Papel', key: 'role', render: (_, i) => i.role.name },
                        { title: 'Convidado por', key: 'by', render: (_, i) => i.invitedBy.name },
                        {
                          title: '',
                          key: 'actions',
                          render: (_, i) =>
                            canManageMembers ? (
                              <Tooltip title="Revogar convite">
                                <Button
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  danger
                                  className="rounded-lg"
                                  onClick={() => handleRevokeInvite(i.id)}
                                />
                              </Tooltip>
                            ) : null,
                        },
                      ]}
                    />
                  </>
                )}
              </div>

              <Modal
                title="Convidar usuário"
                open={inviteOpen}
                onCancel={() => setInviteOpen(false)}
                onOk={() => inviteForm.submit()}
                okText="Enviar convite"
                cancelText="Cancelar"
              >
                <Form form={inviteForm} layout="vertical" onFinish={handleInvite} requiredMark={false}>
                  <Form.Item label="E-mail" name="email" rules={[{ required: true, type: 'email', message: 'Informe um e-mail válido.' }]}>
                    <Input size="large" className="rounded-xl" placeholder="pessoa@exemplo.com" />
                  </Form.Item>
                  <Form.Item label="Papel" name="roleId" rules={[{ required: true, message: 'Escolha um papel.' }]}>
                    <Select size="large" className="rounded-xl" options={roles.map((r) => ({ value: r.id, label: r.name }))} />
                  </Form.Item>
                </Form>
              </Modal>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="rounded-2xl shadow-soft border-dark-100" styles={{ body: { padding: 0 } }}>
              <Form
                layout="vertical"
                initialValues={{ sessionTimeout: localStorage.getItem(SESSION_TIMEOUT_KEY) || '30' }}
                onFinish={handleSaveSecurity}
                requiredMark={false}
              >
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Segurança & Acessos</h2>
                  <p className="text-sm text-dark-500 mt-1">Defina as políticas de sessão para a sua equipe.</p>
                </div>
                <div className="p-6">
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Tempo de inatividade da Sessão</span>}
                        name="sessionTimeout"
                        extra="O usuário será desconectado automaticamente após esse período sem interação."
                      >
                        <Select size="large" className="rounded-xl">
                          <Select.Option value="15">15 Minutos</Select.Option>
                          <Select.Option value="30">30 Minutos</Select.Option>
                          <Select.Option value="60">1 Hora</Select.Option>
                          <Select.Option value="120">2 Horas</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div className="p-6 bg-dark-50/50 border-t border-dark-100 flex justify-end">
                  <Button type="primary" htmlType="submit" size="large" className="rounded-xl font-bold shadow-soft px-8">
                    Salvar Configurações
                  </Button>
                </div>
              </Form>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
