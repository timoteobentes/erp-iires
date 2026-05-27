import { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Row, Col, Skeleton, notification } from 'antd';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { transactionsService } from '../../services/transactions.service';
import { projectsService } from '../../../Projects/services/projects.service';
import { partnersService } from '../../../People/services/partners.service';

// ============================================================
// HELPERS
// ============================================================
const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

const normalizeCurrency = (value: string | undefined) => {
  if (!value) return '';
  const onlyNumbers = String(value).replace(/\D/g, '');
  const numberValue = Number(onlyNumbers) / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

export default function PayablesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id;
  const [form] = Form.useForm();

  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<{ value: string; label: string }[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<{ value: string; label: string }[]>([]);

  // --------------------------------------------------------
  // Carrega projetos e parceiros para os selects
  // --------------------------------------------------------
  useEffect(() => {
    Promise.all([projectsService.list(), partnersService.list()])
      .then(([projects, partners]) => {
        setProjectOptions(projects.map((p) => ({ value: p.id, label: p.name })));
        setPartnerOptions(
          partners
            .filter((p) => p.status === 'active')
            .map((p) => ({ value: p.id, label: p.name })),
        );
      })
      .catch(() => {});
  }, []);

  // --------------------------------------------------------
  // Pré-preenche a partir de navigate state (ex: fornecedor)
  // --------------------------------------------------------
  useEffect(() => {
    if (!isEditing && location.state) {
      const state = location.state as { provider?: string };
      if (state.provider) {
        form.setFieldsValue({ provider: state.provider });
      }
    }
  }, [isEditing, location.state, form]);

  // --------------------------------------------------------
  // Modo edição: carrega dados da transação
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      try {
        setLoadingData(true);
        const t = await transactionsService.getById(id);

        form.setFieldsValue({
          title: t.title,
          provider: t.description ?? '',
          amount: normalizeCurrency(String(Math.round(t.amount * 100))),
          date: t.date ? dayjs(t.date) : undefined,
          category: t.category ?? undefined,
          status: t.status,
          projectId: t.projectId ?? undefined,
          partnerId: t.partnerId ?? undefined,
        });
      } catch {
        notification.error({
          message: 'Erro',
          description: 'Não foi possível carregar os dados da despesa.',
        });
        navigate('/finance/payables');
      } finally {
        setLoadingData(false);
      }
    };

    fetchTransaction();
  }, [id, form, navigate]);

  // --------------------------------------------------------
  // Submit
  // --------------------------------------------------------
  const onFinish = async (values: any) => {
    const payload = {
      title: values.title,
      description: values.provider || undefined,
      type: 'EXPENSE' as const,
      amount: parseCurrencyToNumber(values.amount),
      date: values.date ? values.date.toISOString() : new Date().toISOString(),
      status: values.status ?? 'PENDING',
      category: values.category || 'Outros',
      projectId: values.projectId || undefined,
      partnerId: values.partnerId || undefined,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await transactionsService.update(id!, payload);
        notification.success({ message: 'Despesa atualizada com sucesso!' });
      } else {
        await transactionsService.create(payload);
        notification.success({ message: 'Despesa registrada com sucesso!' });
      }
      navigate('/finance/payables');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar despesa. Tente novamente.';
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/finance/payables')}
            className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white"
          />
          <Skeleton.Input active style={{ width: 240 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/finance/payables')}
          className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white"
        />
        <h1 className="text-2xl font-bold text-dark-900">
          {isEditing ? 'Editar Conta' : 'Nova Conta a Pagar'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ status: 'PENDING' }}
      >
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Descrição do Gasto</span>}
                name="title"
                rules={[{ required: true, message: 'O título é obrigatório' }]}
              >
                <Input
                  size="large"
                  placeholder="Ex: Pagamento Internet Abril"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Fornecedor / Favorecido</span>}
                name="provider"
              >
                <Input
                  size="large"
                  prefix={<User size={16} className="text-dark-300" />}
                  placeholder="Nome da empresa ou pessoa"
                  className="rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Valor</span>}
                name="amount"
                normalize={normalizeCurrency}
                rules={[{ required: true, message: 'O valor é obrigatório' }]}
              >
                <Input
                  size="large"
                  placeholder="R$ 0,00"
                  className="rounded-xl font-bold text-dark-900"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Data de Vencimento / Pagamento</span>}
                name="date"
                rules={[{ required: true, message: 'Informe a data' }]}
              >
                <DatePicker
                  size="large"
                  className="w-full rounded-xl"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Status</span>}
                name="status"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  options={[
                    { value: 'PAID', label: 'Pago' },
                    { value: 'PENDING', label: 'Pendente' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Categoria Financeira</span>}
                name="category"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione a categoria"
                  allowClear
                >
                  <Select.Option value="Operacional">Operacional</Select.Option>
                  <Select.Option value="Projetos">Projetos (Geral)</Select.Option>
                  <Select.Option value="TI / Equipamentos">TI / Equipamentos</Select.Option>
                  <Select.Option value="Recursos Humanos">Recursos Humanos</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Outros">Outros</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Projeto Vinculado</span>}
                name="projectId"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione um projeto (opcional)"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={projectOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Parceiro / Fornecedor Vinculado</span>}
                name="partnerId"
              >
                <Select
                  size="large"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione um parceiro (opcional)"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={partnerOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => navigate('/finance/payables')} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-primary-500 border-none rounded-xl font-bold"
            >
              {isEditing ? 'Atualizar Conta' : 'Salvar Conta'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
