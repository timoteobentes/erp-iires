/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Form, Divider, Switch, message, Avatar, Skeleton, notification } from 'antd';
import {
  User,
  Lock,
  Bell,
  Save,
  Camera,
  ShieldCheck,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuthContext } from '../../Auth/context/AuthContext';
import { authService } from '../../Auth/services/auth.service';
import { normalizePhone } from '../../../utils/masks';
import AvatarEditor from '../../../components/AvatarEditor';
import { getAvatarUrl } from '../../../utils/avatar';

export default function UserProfile() {
  const { user, updateUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState('personal');
  const [formPersonal] = Form.useForm();
  const [formSecurity] = Form.useForm();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);

  // Busca dados frescos do perfil ao montar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const freshUser = await authService.getMe();
        // Sincroniza o contexto com os dados do banco
        updateUser(freshUser);
        formPersonal.setFieldsValue({
          name: freshUser.name,
          email: freshUser.email,
          phone: freshUser.phone ?? '',
        });
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar os dados do perfil.' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salvar dados pessoais
  const handleSavePersonal = async (values: { name: string; phone?: string }) => {
    try {
      setIsSavingPersonal(true);
      const response = await authService.updateMe({
        name: values.name,
        phone: values.phone || undefined,
      });
      // Atualiza contexto global para o Header refletir o novo nome imediatamente
      updateUser(response.user);
      notification.success({ message: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Alterar senha
  const handleSaveSecurity = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('As novas senhas não coincidem!');
      return;
    }

    try {
      setIsSavingSecurity(true);
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notification.success({
        message: 'Sucesso',
        description: 'Senha alterada com sucesso! Use a nova senha no próximo login.',
      });
      formSecurity.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao alterar a senha. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSaveAvatar = async (avatarConfig: string) => {
    try {
      const response = await authService.updateMe({ avatarConfig });
      updateUser(response.user);
      notification.success({ message: 'Avatar salvo com sucesso!' });
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao salvar avatar. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
      throw error;
    }
  };

  const menuItems = [
    { key: 'personal', icon: <User size={20} />, label: 'Dados Pessoais' },
    { key: 'security', icon: <Lock size={20} />, label: 'Segurança & Senha' },
    { key: 'notifications', icon: <Bell size={20} />, label: 'Preferências' },
  ];

  const avatarUrl = getAvatarUrl(user?.avatarConfig, user?.name ?? 'default');
  const displayRole = user?.role ?? user?.group ?? '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Meu Perfil</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gerencie suas informações pessoais, senha e preferências de notificação.</p>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">

        {/* COLUNA ESQUERDA: Identidade e Menu */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full flex flex-col" bodyStyle={{ padding: 0 }}>
            {/* Bloco do Avatar */}
            <div className="p-8 flex flex-col items-center justify-center text-center border-b border-dark-100 bg-dark-50/30 rounded-t-2xl">
              {isLoadingProfile ? (
                <Skeleton.Avatar active size={100} className="mb-4" />
              ) : (
                <div
                  className="relative mb-4 group cursor-pointer"
                  onClick={() => setAvatarEditorOpen(true)}
                  title="Clique para editar o avatar"
                >
                  <Avatar
                    size={100}
                    src={avatarUrl}
                    className="border-4 border-white shadow-md bg-primary-50"
                  />
                  <div className="absolute inset-0 bg-dark-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
              )}

              {isLoadingProfile ? (
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: 140 }} />
              ) : (
                <>
                  <h2 className="text-xl font-bold text-dark-900 leading-tight">{user?.name}</h2>
                  <p className="text-sm font-bold text-primary-600 mt-1">{displayRole}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-dark-50 border border-dark-200 px-3 py-1 rounded-full text-xs font-bold text-dark-500 uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-green-500" />
                    Grupo: {user?.group ?? '—'}
                  </div>
                </>
              )}
            </div>

            {/* Menu de Navegação */}
            <div className="p-4 space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    activeTab === item.key
                      ? 'bg-dark-900 text-white shadow-md'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`}
                >
                  <span className={`${activeTab === item.key ? 'text-primary-400' : 'text-dark-400'}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </Col>

        {/* COLUNA DIREITA: Formulários */}
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: 0 }}>

            {/* ABA 1: DADOS PESSOAIS */}
            <div className={`${activeTab === 'personal' ? 'block' : 'hidden'}`}>
              <div className="p-6 border-b border-dark-100">
                <h2 className="text-xl font-bold text-dark-900">Dados Pessoais</h2>
                <p className="text-sm text-dark-500 mt-1">Atualize suas informações de contato que serão visíveis para a equipe.</p>
              </div>

              {isLoadingProfile ? (
                <div className="p-6">
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              ) : (
                <Form
                  form={formPersonal}
                  layout="vertical"
                  onFinish={handleSavePersonal}
                  className="p-6"
                  requiredMark={false}
                >
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Nome Completo</span>}
                        name="name"
                        rules={[{ required: true, message: 'O nome é obrigatório' }]}
                      >
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">E-mail Corporativo</span>} name="email">
                        <Input
                          size="large"
                          className="rounded-xl"
                          prefix={<Mail size={16} className="text-dark-300 mr-1" />}
                          disabled
                        />
                      </Form.Item>
                      <p className="text-[11px] text-dark-400 -mt-4 mb-4">
                        O e-mail de login só pode ser alterado por um Administrador.
                      </p>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Celular / WhatsApp</span>}
                        name="phone"
                        normalize={normalizePhone}
                      >
                        <Input
                          size="large"
                          className="rounded-xl"
                          prefix={<Smartphone size={16} className="text-dark-300 mr-1" />}
                          placeholder="(00) 00000-0000"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div className="flex justify-end mt-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<Save size={18} />}
                      loading={isSavingPersonal}
                      className="bg-primary-500 border-none rounded-xl font-bold px-8 shadow-soft"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </Form>
              )}
            </div>

            {/* ABA 2: SEGURANÇA & SENHA */}
            <div className={`${activeTab === 'security' ? 'block' : 'hidden'}`}>
              <div className="p-6 border-b border-dark-100">
                <h2 className="text-xl font-bold text-dark-900">Segurança & Senha</h2>
                <p className="text-sm text-dark-500 mt-1">Mantenha sua conta segura alterando sua senha regularmente.</p>
              </div>
              <Form
                form={formSecurity}
                layout="vertical"
                onFinish={handleSaveSecurity}
                className="p-6 space-y-2"
                requiredMark={false}
              >
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label={<span className="font-bold text-dark-600">Senha Atual</span>}
                      name="currentPassword"
                      rules={[{ required: true, message: 'Digite sua senha atual' }]}
                    >
                      <Input.Password size="large" className="rounded-xl" placeholder="••••••••••••" />
                    </Form.Item>
                  </Col>
                  <Col span={24}><Divider className="my-2" /></Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span className="font-bold text-dark-600">Nova Senha</span>}
                      name="newPassword"
                      rules={[{ required: true, min: 6, message: 'Mínimo de 6 caracteres' }]}
                    >
                      <Input.Password size="large" className="rounded-xl" placeholder="Nova senha forte" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span className="font-bold text-dark-600">Confirmar Nova Senha</span>}
                      name="confirmPassword"
                      rules={[{ required: true, message: 'Confirme a nova senha' }]}
                    >
                      <Input.Password size="large" className="rounded-xl" placeholder="Repita a nova senha" />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="flex justify-end mt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<Lock size={18} />}
                    loading={isSavingSecurity}
                    className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold px-8 shadow-soft"
                  >
                    Atualizar Senha
                  </Button>
                </div>
              </Form>
            </div>

            {/* ABA 3: NOTIFICAÇÕES & PREFERÊNCIAS */}
            <div className={`${activeTab === 'notifications' ? 'block' : 'hidden'}`}>
              <div className="p-6 border-b border-dark-100">
                <h2 className="text-xl font-bold text-dark-900">Preferências de Notificação</h2>
                <p className="text-sm text-dark-500 mt-1">Escolha como você quer ser avisado sobre o que acontece no Instituto.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-dark-50/50 rounded-xl border border-dark-100">
                  <div>
                    <p className="font-bold text-dark-900">Relatórios Financeiros Semanais</p>
                    <p className="text-xs text-dark-500 mt-0.5">Receba um resumo de entradas e saídas toda segunda-feira.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-50/50 rounded-xl border border-dark-100">
                  <div>
                    <p className="font-bold text-dark-900">Avisos de Novos Voluntários</p>
                    <p className="text-xs text-dark-500 mt-0.5">Notificar quando um novo voluntário for cadastrado no sistema.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-50/50 rounded-xl border border-dark-100">
                  <div>
                    <p className="font-bold text-dark-900">Alertas de Vencimento (Contas)</p>
                    <p className="text-xs text-dark-500 mt-0.5">Enviar e-mail 3 dias antes do vencimento de uma conta a pagar.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

          </Card>
        </Col>
      </Row>

      <AvatarEditor
        open={avatarEditorOpen}
        currentConfig={user?.avatarConfig}
        userSeed={user?.name ?? 'default'}
        onClose={() => setAvatarEditorOpen(false)}
        onSave={handleSaveAvatar}
      />
    </div>
  );
}
