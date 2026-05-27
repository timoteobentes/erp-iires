import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Skeleton, notification } from 'antd';
import { ArrowLeft, User, MapPin, Shield, Phone, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';
import { teamService } from '../../services/team.service';

// ============================================================
// OPÇÕES DOS SELECTS (valores capitalizados = o que o banco guarda)
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
// COMPONENTE
// ============================================================

export default function TeamForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);

  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------------
  // Modo edição: carrega os dados do membro
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        setLoadingData(true);
        const member = await teamService.getById(id);

        // Mapeia resposta do backend → campos do formulário
        form.setFieldsValue({
          name: member.name,
          email: member.email,
          personal_email: member.personalEmail ?? '',
          cpf: normalizeCPF(member.cpf ?? ''),
          phone: normalizePhone(member.phone ?? ''),
          role: member.role ?? '',
          level: member.level ?? undefined,
          group: member.group ?? undefined,
          // Endereço: backend retorna address.street, form usa campo "address"
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
      } else {
        await teamService.create(payload);
        notification.success({
          message: 'Sucesso',
          description: 'Colaborador cadastrado! Senha padrão: Mudar@123',
        });
      }

      navigate('/people/team');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar colaborador. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // Skeleton enquanto carrega no modo edição
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
                label={<span className="font-bold text-dark-600">Nome Completo</span>}
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

          {/* ── Seção 2: Endereço ── */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Endereço Residencial</h2>
          </div>

          <Row gutter={24}>
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
                id="team_form_number"
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
                label={<span className="font-bold text-dark-600">Cargo</span>}
                name="role"
                rules={[{ required: true, message: 'O cargo é obrigatório' }]}
              >
                <Input size="large" className="rounded-xl" placeholder="Ex: Analista de TI" />
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
                  placeholder="Selecione o nível"
                  options={LEVEL_OPTIONS}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Divider className="my-4" />
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">E-mail de Login (Corporativo)</span>}
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
                  // Bloqueia edição do e-mail no modo edição (evita conflitos de identidade)
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
                label={<span className="font-bold text-dark-600">Grupo de Acesso (Permissões)</span>}
                name="group"
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

          <div className="flex justify-end gap-3 mt-8">
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
