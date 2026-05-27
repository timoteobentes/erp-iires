import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Radio, Skeleton, notification } from 'antd';
import { ArrowLeft, Building2, MapPin, Loader2, Contact } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { useCnpj } from '../../hooks/useCnpj';
import { normalizeCNPJ, normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';
import { partnersService } from '../../services/partners.service';

export default function PartnersForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);
  const { loadingCnpj, handleCNPJBlur } = useCnpj(form);

  const [personType, setPersonType] = useState<'PJ' | 'PF'>('PJ');
  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------------
  // Modo edição: carrega os dados do parceiro
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchPartner = async () => {
      try {
        setLoadingData(true);
        const p = await partnersService.getById(id);

        // Detecta PJ (CNPJ = 14 dígitos) ou PF
        const rawCnpj = (p.cnpj ?? '').replace(/\D/g, '');
        const detectedType: 'PJ' | 'PF' = rawCnpj.length === 14 ? 'PJ' : 'PF';
        setPersonType(detectedType);

        const maskFn = detectedType === 'PJ' ? normalizeCNPJ : normalizeCPF;

        form.setFieldsValue({
          type: p.partnershipType ?? 'Fornecedor',
          personType: detectedType,
          name: p.name,
          document: maskFn(p.cnpj ?? ''),
          contactName: p.contactName ?? '',
          phone: normalizePhone(p.phone ?? ''),
          email: p.email ?? '',
          // Endereço
          cep: normalizeCEP(p.address?.cep ?? ''),
          address: p.address?.street ?? '',
          number: p.address?.number ?? '',
          neighborhood: p.address?.neighborhood ?? '',
          city: p.address?.city ?? '',
          state: p.address?.state ?? '',
        });
      } catch {
        notification.error({
          message: 'Erro',
          description: 'Não foi possível carregar os dados do registro.',
        });
        navigate('/people/partners');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPartner();
  }, [id, form, navigate]);

  // --------------------------------------------------------
  // Submit
  // --------------------------------------------------------
  const onFinish = async (values: any) => {
    const formData = {
      ...values,
      document: stripMask(values.document),
      phone: stripMask(values.phone),
      cep: stripMask(values.cep),
    };

    try {
      setSubmitting(true);

      if (isEditing) {
        await partnersService.update(id!, formData);
        notification.success({
          message: 'Sucesso',
          description: 'Dados do registro atualizados com sucesso!',
        });
      } else {
        await partnersService.create(formData);
        notification.success({
          message: 'Sucesso',
          description: 'Parceiro/Fornecedor cadastrado com sucesso!',
        });
      }

      navigate('/people/partners');
    } catch (error: any) {
      const msg =
        error.response?.data?.error ?? 'Erro ao salvar registro. Tente novamente.';
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
            onClick={() => navigate('/people/partners')}
            className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
          />
          <Skeleton.Input active style={{ width: 280 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
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
          onClick={() => navigate('/people/partners')}
          className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center"
        />
        <h1 className="text-2xl font-bold text-dark-900">
          {isEditing ? 'Editar Registro' : 'Novo Parceiro ou Fornecedor'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ type: 'Fornecedor', personType: 'PJ' }}
      >
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-dark-900">
              <Building2 size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Informações Institucionais</h2>
            </div>
            <Form.Item name="type" className="mb-0">
              <Radio.Group buttonStyle="solid">
                <Radio.Button value="Fornecedor" className="rounded-l-lg font-medium px-4">
                  Fornecedor
                </Radio.Button>
                <Radio.Button value="Parceiro" className="rounded-r-lg font-medium px-4">
                  Parceiro Institucional
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Tipo</span>}
                name="personType"
              >
                <Select
                  size="large"
                  className="rounded-xl"
                  onChange={(v: 'PJ' | 'PF') => setPersonType(v)}
                  disabled={isEditing}
                  options={[
                    { value: 'PJ', label: 'Pessoa Jurídica' },
                    { value: 'PF', label: 'Pessoa Física' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={18}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">
                    {personType === 'PJ' ? 'Razão Social / Nome Fantasia' : 'Nome Completo'}
                  </span>
                }
                name="name"
                rules={[{ required: true, message: 'O nome é obrigatório' }]}
              >
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={
                  <span className="font-bold text-dark-600">
                    {personType === 'PJ' ? 'CNPJ' : 'CPF'}
                  </span>
                }
                name="document"
                normalize={personType === 'PJ' ? normalizeCNPJ : normalizeCPF}
              >
                <Input
                  size="large"
                  maxLength={personType === 'PJ' ? 18 : 14}
                  className="rounded-xl"
                  onBlur={personType === 'PJ' ? handleCNPJBlur : undefined}
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
                  O documento não pode ser alterado.
                </p>
              )}
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Dados de Contato */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Contact size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Contato do Responsável</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Nome do Contato</span>}
                name="contactName"
              >
                <Input size="large" className="rounded-xl" placeholder="Quem atende a gente?" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Telefone / Celular</span>}
                name="phone"
                normalize={normalizePhone}
              >
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="font-bold text-dark-600">E-mail Comercial</span>}
                name="email"
                rules={[{ type: 'email', message: 'Formato de e-mail inválido' }]}
              >
                <Input size="large" className="rounded-xl" placeholder="vendas@empresa.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Endereço */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-dark-500" />
            <h2 className="text-lg font-bold">Localização</h2>
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

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-dark-100">
            <Button
              size="large"
              onClick={() => navigate('/people/partners')}
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
              {isEditing ? 'Atualizar Registro' : 'Salvar Registro'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
