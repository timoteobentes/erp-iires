import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Radio, Checkbox, Skeleton, notification, Alert } from 'antd';
import { ArrowLeft, User, MapPin, HeartHandshake, Building2, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { useCnpj } from '../../hooks/useCnpj';
import { normalizeCPF, normalizeCNPJ, normalizePhone, normalizeCEP } from '../../../../utils/masks';
import { networkService, type NetworkPerson } from '../../services/network.service';

export default function NetworkForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);
  const { loadingCnpj, handleCNPJBlur } = useCnpj(form);

  const [personKind, setPersonKind] = useState<'PF' | 'PJ'>('PF');
  const [isDonor, setIsDonor] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [current, setCurrent] = useState<NetworkPerson | null>(null);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const hadDonorRole = current?.roles.includes('DONOR') ?? false;
  const hadPartnerRole = current?.roles.includes('PARTNER') ?? false;
  const isPF = personKind === 'PF';
  const documentMask = isPF ? normalizeCPF : normalizeCNPJ;

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoadingData(true);
        const p = await networkService.getById(id);
        setCurrent(p);
        const kind: 'PF' | 'PJ' = p.kind === 'COMPANY' ? 'PJ' : 'PF';
        setPersonKind(kind);
        setIsDonor(p.roles.includes('DONOR'));
        setIsPartner(p.roles.includes('PARTNER'));
        const maskFn = kind === 'PJ' ? normalizeCNPJ : normalizeCPF;

        form.setFieldsValue({
          personKind: kind,
          name: p.name,
          document: maskFn(p.document ?? ''),
          phone: normalizePhone(p.phone ?? ''),
          email: p.email ?? '',
          recurrence: p.donationRecurrence ?? undefined,
          paymentMethod: p.preferredPayment ?? undefined,
          partnershipType: p.partnershipType ?? 'Parceiro',
          contactName: p.contactName ?? '',
          cep: normalizeCEP(p.zipCode ?? ''),
          address: p.street ?? '',
          number: p.number ?? '',
          neighborhood: p.neighborhood ?? '',
          city: p.city ?? '',
          state: p.state ?? '',
        });
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar o registro.' });
        navigate('/people/network');
      } finally {
        setLoadingData(false);
      }
    };
    fetch();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    if (!isDonor && !isPartner) {
      notification.error({ message: 'Atenção', description: 'Selecione ao menos um papel: Doador ou Parceiro/Fornecedor.' });
      return;
    }

    const payload = {
      ...values,
      personKind,
      isDonor,
      isPartner,
    };

    try {
      setSubmitting(true);

      if (isEditing && current) {
        await networkService.update(id!, current, payload);
        if (isDonor && !hadDonorRole) {
          await networkService.addRole(current, 'DONOR', payload);
        }
        if (isPartner && !hadPartnerRole) {
          await networkService.addRole(current, 'PARTNER', payload);
        }
        notification.success({ message: 'Sucesso', description: 'Dados atualizados com sucesso!' });
      } else {
        await networkService.create(payload);
        notification.success({ message: 'Sucesso', description: 'Registro cadastrado com sucesso!' });
      }

      navigate('/people/network');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/people/network')} className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" />
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
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/people/network')} className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" />
        <h1 className="text-2xl font-bold text-dark-900">{isEditing ? 'Editar Registro' : 'Novo Registro'}</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ personKind: 'PF', partnershipType: 'Parceiro' }}>
        {/* Papéis */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-4 text-dark-900">
            <HeartHandshake size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Qual é a relação com a instituição?</h2>
          </div>
          <p className="text-sm text-dark-400 mb-4">
            A mesma pessoa pode ser doadora e parceira ao mesmo tempo — marque quantos papéis fizerem sentido.
          </p>
          <div className="flex flex-wrap gap-6">
            <Checkbox checked={isDonor} disabled={hadDonorRole} onChange={(e) => setIsDonor(e.target.checked)}>
              <span className="font-bold">Doador(a)</span>
            </Checkbox>
            <Checkbox checked={isPartner} disabled={hadPartnerRole} onChange={(e) => setIsPartner(e.target.checked)}>
              <span className="font-bold">Parceiro ou Fornecedor</span>
            </Checkbox>
          </div>
          {(hadDonorRole || hadPartnerRole) && (
            <Alert
              className="mt-4 rounded-xl"
              type="info"
              showIcon
              message="Papéis já existentes não podem ser removidos por aqui — apenas adicionados."
            />
          )}
        </Card>

        {/* Dados básicos */}
        <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-dark-900">
              <User size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Informações Básicas</h2>
            </div>
            <Form.Item name="personKind" className="mb-0">
              <Radio.Group
                onChange={(e) => { setPersonKind(e.target.value); if (!isEditing) form.setFieldValue('document', ''); }}
                buttonStyle="solid"
                disabled={isEditing}
              >
                <Radio.Button value="PF" className="rounded-l-lg font-medium px-6">Pessoa Física</Radio.Button>
                <Radio.Button value="PJ" className="rounded-r-lg font-medium px-6">Pessoa Jurídica</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label={<span className="font-bold text-dark-600">{isPF ? 'Nome Completo' : 'Razão Social'}</span>} name="name" rules={[{ required: true, message: 'O nome é obrigatório' }]}>
                <Input size="large" className="rounded-xl" placeholder={isPF ? 'Nome completo' : 'Nome da empresa'} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">{isPF ? 'CPF' : 'CNPJ'}</span>} name="document" normalize={documentMask}>
                <Input
                  size="large" maxLength={isPF ? 14 : 18} className="rounded-xl"
                  placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'}
                  onBlur={!isPF ? handleCNPJBlur : undefined}
                  suffix={loadingCnpj && <Loader2 size={16} className="animate-spin text-secondary-500" />}
                  disabled={isEditing}
                />
              </Form.Item>
              {isEditing && <p className="text-[11px] text-dark-400 -mt-4 mb-4">O documento não pode ser alterado.</p>}
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Celular / Telefone</span>} name="phone" normalize={normalizePhone}>
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">E-mail</span>} name="email" rules={[{ type: 'email', message: 'Formato de e-mail inválido' }]}>
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Endereço</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item label={<span className="font-bold text-dark-600">CEP</span>} name="cep" normalize={normalizeCEP}>
                <Input size="large" maxLength={9} className="rounded-xl" onBlur={handleCEPBlur} suffix={loadingCep && <Loader2 size={16} className="animate-spin text-primary-500" />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Logradouro</span>} name="address">
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label={<span className="font-bold text-dark-600">Número</span>} name="number">
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item label={<span className="font-bold text-dark-600">Bairro</span>} name="neighborhood">
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

        {/* Perfil de doação */}
        {isDonor && (
          <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-6 text-dark-900">
              <HeartHandshake size={20} className="text-warning" />
              <h2 className="text-lg font-bold">Perfil de Doação</h2>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="font-bold text-dark-600">Recorrência Principal</span>} name="recurrence">
                  <Select size="large" className="rounded-xl" placeholder="Ex: Mensal">
                    <Select.Option value="Mensal">Mensal</Select.Option>
                    <Select.Option value="Trimestral">Trimestral</Select.Option>
                    <Select.Option value="Anual">Anual</Select.Option>
                    <Select.Option value="Unica">Doação Única</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="font-bold text-dark-600">Método de Pagamento Preferido</span>} name="paymentMethod">
                  <Select size="large" className="rounded-xl" placeholder="Ex: PIX, Cartão...">
                    <Select.Option value="PIX">PIX</Select.Option>
                    <Select.Option value="Cartao">Cartão de Crédito</Select.Option>
                    <Select.Option value="Boleto">Boleto Bancário</Select.Option>
                    <Select.Option value="Transferencia">Transferência TED/DOC</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        {/* Perfil de parceria */}
        {isPartner && (
          <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-6 text-dark-900">
              <Building2 size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Perfil de Parceria</h2>
            </div>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="font-bold text-dark-600">Tipo</span>} name="partnershipType">
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="Fornecedor">Fornecedor</Radio.Button>
                    <Radio.Button value="Parceiro">Parceiro Institucional</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={<span className="font-bold text-dark-600">Nome do Contato</span>} name="contactName">
                  <Input size="large" className="rounded-xl" placeholder="Quem atende a gente?" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button size="large" onClick={() => navigate('/people/network')} className="rounded-xl px-8">Cancelar</Button>
          <Button size="large" type="primary" htmlType="submit" loading={submitting} className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft px-8 flex items-center">
            {isEditing ? 'Atualizar Dados' : 'Salvar Registro'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
