import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Radio, Skeleton, notification } from 'antd';
import { ArrowLeft, User, MapPin, HeartHandshake, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { useCnpj } from '../../hooks/useCnpj';
import { normalizeCPF, normalizeCNPJ, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';
import { donorsService } from '../../services/donors.service';

export default function DonorsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);
  const { loadingCnpj, handleCNPJBlur } = useCnpj(form);

  const [donorType, setDonorType] = useState<'PF' | 'PJ'>('PF');
  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const isPF = donorType === 'PF';
  const documentMask = isPF ? normalizeCPF : normalizeCNPJ;
  const documentMaxLength = isPF ? 14 : 18;

  // --------------------------------------------------------
  // Modo edição: carrega os dados do doador
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchDonor = async () => {
      try {
        setLoadingData(true);
        const d = await donorsService.getById(id);

        // Determina o tipo para ajustar a máscara
        const type = (d.type as 'PF' | 'PJ') ?? 'PF';
        setDonorType(type);

        const maskFn = type === 'PF' ? normalizeCPF : normalizeCNPJ;

        form.setFieldsValue({
          type,
          name: d.name,
          document: maskFn(d.document ?? ''),
          phone: normalizePhone(d.phone ?? ''),
          email: d.email ?? '',
          recurrence: d.recurrence ?? undefined,
          paymentMethod: d.paymentMethod ?? undefined,
          // Endereço
          cep: normalizeCEP(d.address?.cep ?? ''),
          address: d.address?.street ?? '',
          number: d.address?.number ?? '',
          neighborhood: d.address?.neighborhood ?? '',
          city: d.address?.city ?? '',
          state: d.address?.state ?? '',
        });
      } catch {
        notification.error({
          message: 'Erro',
          description: 'Não foi possível carregar os dados do doador.',
        });
        navigate('/people/donors');
      } finally {
        setLoadingData(false);
      }
    };

    fetchDonor();
  }, [id, form, navigate]);

  // --------------------------------------------------------
  // Submit
  // --------------------------------------------------------
  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      document: stripMask(values.document),
      phone: stripMask(values.phone),
      cep: stripMask(values.cep),
    };

    try {
      setSubmitting(true);

      if (isEditing) {
        await donorsService.update(id!, payload);
        notification.success({
          message: 'Sucesso',
          description: 'Dados do doador atualizados com sucesso!',
        });
      } else {
        await donorsService.create(payload);
        notification.success({
          message: 'Sucesso',
          description: 'Doador cadastrado com sucesso!',
        });
      }

      navigate('/people/donors');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar doador. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // Skeleton de carregamento
  // --------------------------------------------------------
  if (loadingData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/donors')}
            className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
          />
          <Skeleton.Input active style={{ width: 280 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/people/donors')}
          className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
        />
        <h1 className="text-2xl font-bold text-dark-900">
          {isEditing ? 'Editar Doador' : 'Novo Doador'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ type: 'PF' }}
      >
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-dark-900">
              <User size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Informações Básicas</h2>
            </div>
            <Form.Item name="type" className="mb-0">
              <Radio.Group
                onChange={(e) => {
                  setDonorType(e.target.value);
                  if (!isEditing) form.setFieldValue('document', '');
                }}
                buttonStyle="solid"
                disabled={isEditing} // documento não pode mudar (chave única)
              >
                <Radio.Button value="PF" className="rounded-l-lg font-medium px-6">
                  Pessoa Física
                </Radio.Button>
                <Radio.Button value="PJ" className="rounded-r-lg font-medium px-6">
                  Pessoa Jurídica
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">
                    {isPF ? 'Nome Completo' : 'Razão Social'}
                  </span>
                }
                name="name"
                rules={[{ required: true, message: 'O nome é obrigatório' }]}
              >
                <Input
                  size="large"
                  className="rounded-xl"
                  placeholder={isPF ? 'Nome do doador' : 'Nome da empresa'}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">{isPF ? 'CPF' : 'CNPJ'}</span>
                }
                name="document"
                normalize={documentMask}
              >
                <Input
                  size="large"
                  maxLength={documentMaxLength}
                  className="rounded-xl"
                  placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
                  onBlur={!isPF ? handleCNPJBlur : undefined}
                  suffix={
                    loadingCnpj && (
                      <Loader2 size={16} className="animate-spin text-secondary-500" />
                    )
                  }
                  disabled={isEditing}
                />
              </Form.Item>
              {isEditing && (
                <p className="text-[11px] text-dark-400 -mt-4 mb-4">
                  O documento de identificação não pode ser alterado.
                </p>
              )}
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">Celular / Telefone Comercial</span>
                }
                name="phone"
                normalize={normalizePhone}
              >
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">E-mail de Contato</span>}
                name="email"
                rules={[{ type: 'email', message: 'Formato de e-mail inválido' }]}
              >
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Endereço */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Endereço de Faturamento</h2>
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
                  maxLength={9}
                  className="rounded-xl"
                  onBlur={handleCEPBlur}
                  suffix={
                    loadingCep && (
                      <Loader2 size={16} className="animate-spin text-primary-500" />
                    )
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Logradouro</span>}
                name="address"
              >
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Número</span>}
                name="number"
              >
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Bairro</span>}
                name="neighborhood"
              >
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item label={<span className="font-bold text-dark-600">Cidade</span>} name="city">
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label={<span className="font-bold text-dark-600">UF</span>} name="state">
                <Input size="large" className="rounded-xl" maxLength={2} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Preferências de Doação */}
        <Card
          className="rounded-2xl shadow-soft border-dark-100 mt-6"
          bodyStyle={{ padding: '32px' }}
        >
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <HeartHandshake size={20} className="text-warning" />
            <h2 className="text-lg font-bold">Perfil de Doação</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Recorrência Principal</span>}
                name="recurrence"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Ex: Mensal"
                >
                  <Select.Option value="Mensal">Mensal</Select.Option>
                  <Select.Option value="Trimestral">Trimestral</Select.Option>
                  <Select.Option value="Anual">Anual</Select.Option>
                  <Select.Option value="Unica">Doação Única</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">Método de Pagamento Preferido</span>
                }
                name="paymentMethod"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Ex: PIX, Cartão..."
                >
                  <Select.Option value="PIX">PIX</Select.Option>
                  <Select.Option value="Cartao">Cartão de Crédito</Select.Option>
                  <Select.Option value="Boleto">Boleto Bancário</Select.Option>
                  <Select.Option value="Transferencia">Transferência TED/DOC</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              size="large"
              onClick={() => navigate('/people/donors')}
              className="rounded-xl px-8"
            >
              Cancelar
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft px-8 flex items-center"
            >
              {isEditing ? 'Atualizar Dados' : 'Salvar Doador'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
