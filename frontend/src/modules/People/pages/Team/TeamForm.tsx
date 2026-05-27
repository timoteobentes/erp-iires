import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Skeleton, notification, Modal } from 'antd';
import { ArrowLeft, User, MapPin, Shield, Phone, Loader2, Copy, CheckCheck, KeyRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';
import { teamService } from '../../services/team.service';

// ============================================================
// OPÇÕES DOS SELECTS
// ============================================================

const LEVEL_OPTIONS = [
  { value: 'Diretor', label: 'Diretor' },
  { value: 'Líder', label: 'Líder / Coordenador' },
  { value: 'Operacional', label: 'Operacional / Funcionário' },
  { value: 'Voluntário', label: 'Voluntário' },
];

const GROUP_OPTIONS = [
  { value: 'Administrador', label: 'Administrador (Total)' },
  { value: 'Comercial', label: 'Comercial / CRM' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Tecnologia', label: 'Tecnologia / Inovação' },
  { value: 'Inovação', label: 'Inovação & Projetos' },
];

// ============================================================
// MODAL DE CREDENCIAIS — exibido após criação do colaborador
// ============================================================

interface CredentialsModalProps {
  open: boolean;
  email: string;
  password: string;
  name: string;
  onClose: () => void;
}

function CredentialsModal({ open, email, password, name, onClose }: CredentialsModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Entendido, fechar"
      cancelButtonProps={{ style: { display: 'none' } }}
      title={
        <div className="flex items-center gap-2 text-dark-900">
          <KeyRound size={20} className="text-primary-500" />
          <span className="font-bold">Colaborador criado — Credenciais de acesso</span>
        </div>
      }
      width={480}
      centered
    >
      <div className="space-y-4 py-2">
        <p className="text-dark-500 text-sm">
          <strong className="text-dark-800">{name}</strong> foi cadastrado com sucesso.
          Compartilhe as credenciais abaixo com o colaborador. Elas <strong>não poderão ser recuperadas</strong> depois desta tela.
        </p>

        {/* E-mail */}
        <div className="rounded-xl border border-dark-100 bg-dark-50 p-4">
          <p className="text-[11px] font-bold text-dark-400 uppercase tracking-wider mb-1">E-mail de Login</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-dark-900">{email}</span>
            <Button
              type="text"
              size="small"
              icon={copiedEmail ? <CheckCheck size={16} className="text-secondary-500" /> : <Copy size={16} />}
              onClick={() => copy(email, setCopiedEmail)}
              className="text-dark-400 hover:text-primary-500 shrink-0"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
          <p className="text-[11px] font-bold text-primary-400 uppercase tracking-wider mb-1">Senha Temporária</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-primary-700 text-lg tracking-widest">{password}</span>
            <Button
              type="text"
              size="small"
              icon={copiedPassword ? <CheckCheck size={16} className="text-secondary-500" /> : <Copy size={16} />}
              onClick={() => copy(password, setCopiedPassword)}
              className="text-primary-400 hover:text-primary-600 shrink-0"
            />
          </div>
        </div>

        <p className="text-[11px] text-dark-400 flex items-start gap-1.5">
          <span className="text-warning mt-0.5">⚠</span>
          O colaborador deve alterar a senha no primeiro acesso pelo perfil do sistema.
        </p>
      </div>
    </Modal>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function TeamForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);

  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Modal de credenciais
  const [credModal, setCredModal] = useState<{ open: boolean; email: string; password: string; name: string }>({
    open: false,
    email: '',
    password: '',
    name: '',
  });

  // --------------------------------------------------------
  // Modo edição: carrega os dados do membro
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        setLoadingData(true);
        const member = await teamService.getById(id);

        form.setFieldsValue({
          name: member.name,
          email: member.email,
          personal_email: member.personalEmail ?? '',
          cpf: normalizeCPF(member.cpf ?? ''),
          phone: normalizePhone(member.phone ?? ''),
          role: member.role ?? '',
          level: member.level ?? undefined,
          group: member.group ?? undefined,
          cep: normalizeCEP(member.address?.cep ?? ''),
          address: member.address?.street ?? '',
          number: member.address?.number ?? '',
          neighborhood: member.address?.neighborhood ?? '',
          city: member.address?.city ?? '',
          state: member.address?.state ?? '',
        });
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar os dados do colaborador.' });
        navigate('/people/team');
      } finally {
        setLoadingData(false);
      }
    };

    fetchMember();
  }, [id, form, navigate]);

  // --------------------------------------------------------
  // Submit
  // --------------------------------------------------------
  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      cpf: stripMask(values.cpf),
      phone: stripMask(values.phone),
      cep: stripMask(values.cep),
    };

    try {
      setSubmitting(true);

      if (isEditing) {
        await teamService.update(id!, payload);
        notification.success({ message: 'Sucesso', description: 'Dados do colaborador atualizados com sucesso!' });
        navigate('/people/team');
      } else {
        const response = await teamService.create(payload);
        // Exibe modal com credenciais geradas pelo backend
        setCredModal({
          open: true,
          email: values.email,
          password: response.temporaryPassword ?? '',
          name: values.name,
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar colaborador. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // Skeleton
  // --------------------------------------------------------
  if (loadingData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/team')}
            className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
          />
          <Skeleton.Input active style={{ width: 280 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Modal de credenciais */}
      <CredentialsModal
        open={credModal.open}
        email={credModal.email}
        password={credModal.password}
        name={credModal.name}
        onClose={() => {
          setCredModal((s) => ({ ...s, open: false }));
          navigate('/people/team');
        }}
      />

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/people/team')}
          className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
        />
        <h1 className="text-2xl font-bold text-dark-900">
          {isEditing ? 'Editar Colaborador' : 'Cadastrar Funcionário'}
        </h1>
      </div>

      <Form form={form} name="team_form" layout="vertical" onFinish={onFinish} requiredMark={false}>

        {/* ── Seção 1: Dados Pessoais ── */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <User size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Informações Pessoais & Contato</h2>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Nome Completo <span className="text-red-500">*</span></span>}
                name="name"
                rules={[{ required: true, message: 'O nome é obrigatório' }]}
              >
                <Input size="large" className="rounded-xl" placeholder="Nome do colaborador" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-bold text-dark-600">CPF</span>}
                name="cpf"
                normalize={normalizeCPF}
              >
                <Input size="large" className="rounded-xl" placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">E-mail Pessoal</span>}
                name="personal_email"
              >
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Celular / WhatsApp</span>}
                name="phone"
                normalize={normalizePhone}
              >
                <Input
                  size="large"
                  prefix={<Phone size={16} className="text-dark-300" />}
                  className="rounded-xl"
                  placeholder="(00) 00000-0000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* ── Seção 2: Endereço (opcional) ── */}
          <div className="flex items-center gap-2 mb-2 text-dark-900">
            <MapPin size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Endereço Residencial</h2>
            <span className="text-xs text-dark-400 font-medium ml-1">(opcional — pode ser preenchido depois)</span>
          </div>

          <Row gutter={24} className="mt-4">
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-bold text-dark-600">CEP</span>}
                name="cep"
                normalize={normalizeCEP}
              >
                <Input
                  size="large"
                  className="rounded-xl"
                  placeholder="00000-000"
                  onBlur={handleCEPBlur}
                  suffix={loadingCep && <Loader2 size={16} className="animate-spin text-primary-500" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Logradouro</span>}
                name="address"
              >
                <Input size="large" className="rounded-xl" placeholder="Rua, Avenida..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Número</span>}
                name="number"
              >
                <Input size="large" className="rounded-xl" placeholder="123" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Bairro</span>}
                name="neighborhood"
              >
                <Input size="large" className="rounded-xl" placeholder="Bairro" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item label={<span className="font-bold text-dark-600">Cidade</span>} name="city">
                <Input size="large" className="rounded-xl" placeholder="Cidade" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label={<span className="font-bold text-dark-600">UF</span>} name="state">
                <Input size="large" className="rounded-xl" placeholder="UF" maxLength={2} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ── Seção 3: Cargo & Acesso ── */}
        <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Shield size={20} className="text-warning" />
            <h2 className="text-lg font-bold">Cargo & Acesso ao Sistema</h2>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Cargo / Função</span>}
                name="role"
              >
                <Input size="large" className="rounded-xl" placeholder="Ex: Analista de TI (opcional)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Nível Hierárquico</span>}
                name="level"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione o nível (opcional)"
                  options={LEVEL_OPTIONS}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Divider className="my-4" />
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">E-mail de Login (Corporativo) <span className="text-red-500">*</span></span>}
                name="email"
                rules={[
                  { required: true, message: 'O e-mail é obrigatório' },
                  { type: 'email', message: 'Formato de e-mail inválido' },
                ]}
              >
                <Input
                  size="large"
                  className="rounded-xl"
                  placeholder="login@iires.org"
                  disabled={isEditing}
                />
              </Form.Item>
              {isEditing && (
                <p className="text-[11px] text-dark-400 -mt-4 mb-4">
                  O e-mail de login não pode ser alterado por aqui.
                </p>
              )}
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Grupo de Acesso (Permissões) <span className="text-red-500">*</span></span>}
                name="group"
                rules={[{ required: true, message: 'Selecione o grupo de acesso' }]}
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione o grupo"
                  options={GROUP_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {!isEditing && (
            <div className="mt-2 mb-6 p-4 rounded-xl bg-dark-50 border border-dark-100 flex items-start gap-3">
              <KeyRound size={18} className="text-dark-400 shrink-0 mt-0.5" />
              <p className="text-sm text-dark-500">
                Uma <strong className="text-dark-700">senha temporária única</strong> será gerada automaticamente.
                Ela será exibida somente uma vez após o cadastro — guarde e compartilhe com o colaborador.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button size="large" onClick={() => navigate('/people/team')} className="rounded-xl px-8">
              Cancelar
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft px-8 flex items-center"
            >
              {isEditing ? 'Atualizar Dados' : 'Finalizar Cadastro'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
