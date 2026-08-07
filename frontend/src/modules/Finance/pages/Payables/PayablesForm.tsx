import { useEffect, useRef, useState } from 'react';
import ptBR from 'antd/locale/pt_BR';
import {
  Form, Input, Button, DatePicker, Select, Card, Row, Col,
  Skeleton, notification, InputNumber, Divider,
} from 'antd';
import { ArrowLeft, User, Repeat, CreditCard, Layers } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { transactionsService } from '../../services/transactions.service';
import { projectsService } from '../../../Projects/services/projects.service';
import { networkService } from '../../../People/services/network.service';
import { accountPlansService, type AccountPlan } from '../../services/accountPlans.service';
import { costCentersService, type CostCenter } from '../../services/costCenters.service';
import { AttachmentUploader, type AttachmentUploaderHandle } from '../../components/AttachmentUploader';
import { InstitutionalContextSelect } from '../../../../components/InstitutionalContextSelect';

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

const parseCurrency = (v: string): number => {
  if (!v) return 0;
  return parseFloat(String(v).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
};

const formatCurrency = (v: string | undefined) => {
  if (!v) return '';
  const n = Number(String(v).replace(/\D/g, '')) / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

type Mode = 'single' | 'installment' | 'recurring';

const MODES: { value: Mode; label: string; icon: React.ReactNode }[] = [
  { value: 'single',      label: 'Único',      icon: <CreditCard size={14} /> },
  { value: 'installment', label: 'Parcelado',  icon: <Layers size={14} /> },
  { value: 'recurring',   label: 'Recorrente', icon: <Repeat size={14} /> },
];

// ──────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────

export default function PayablesForm() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const location   = useLocation();
  const isEditing  = !!id;
  const [form]     = Form.useForm();

  const [loadingData, setLoadingData]           = useState(isEditing);
  const [submitting, setSubmitting]             = useState(false);
  const [mode, setMode]                         = useState<Mode>('single');
  const [installmentTotal, setInstallmentTotal] = useState(2);
  const [projectOptions, setProjectOptions]     = useState<{ value: string; label: string }[]>([]);
  const [personOptions, setPersonOptions]       = useState<{ value: string; label: string }[]>([]);
  const [accountPlans, setAccountPlans]         = useState<AccountPlan[]>([]);
  const [costCenters, setCostCenters]           = useState<CostCenter[]>([]);
  const attachmentUploaderRef                   = useRef<AttachmentUploaderHandle>(null);

  // totalAmount derivado do valor normalizado do formulário
  const amountWatched = Form.useWatch('amount', form);
  const totalAmount   = parseCurrency(amountWatched ?? '');

  useEffect(() => {
    Promise.all([
      projectsService.list(),
      networkService.list(),
      accountPlansService.list({ type: 'EXPENSE', active: true }),
      costCentersService.list(true),
    ]).then(([projects, people, plans, centers]) => {
      setProjectOptions(projects.map((p) => ({ value: p.id, label: p.name })));
      setPersonOptions(people.filter((p) => p.status === 'ACTIVE').map((p) => ({ value: p.id, label: p.name })));
      setAccountPlans(plans);
      setCostCenters(centers);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing && location.state) {
      const state = location.state as { provider?: string };
      if (state.provider) form.setFieldsValue({ provider: state.provider });
    }
  }, [isEditing, location.state, form]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoadingData(true);
        const t = await transactionsService.getById(id);
        form.setFieldsValue({
          title:         t.title,
          provider:      t.description ?? '',
          amount:        formatCurrency(String(Math.round(t.amount * 100))),
          date:          t.date ? dayjs(t.date) : undefined,
          status:        t.status,
          paymentMethod: t.paymentMethod ?? undefined,
          accountPlanId: t.accountPlanId ?? undefined,
          costCenterId:  t.costCenterId  ?? undefined,
          observations:  t.observations  ?? '',
          projectId:     t.projectId     ?? undefined,
          personId:      t.personId      ?? undefined,
          contextId:     t.contextId     ?? undefined,
        });
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar os dados da despesa.' });
        navigate('/finance/payables');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    const base = {
      type:          'EXPENSE' as const,
      title:         values.title,
      description:   values.provider  || undefined,
      amount:        parseCurrency(values.amount),
      date:          values.date ? values.date.toISOString() : new Date().toISOString(),
      status:        values.status  ?? 'PENDING',
      paymentMethod: values.paymentMethod || undefined,
      observations:  values.observations  || undefined,
      accountPlanId: values.accountPlanId || undefined,
      costCenterId:  values.costCenterId  || undefined,
      projectId:     values.projectId     || undefined,
      personId:      values.personId      || undefined,
      contextId:     values.contextId     || undefined,
    };

    try {
      setSubmitting(true);
      let firstTransactionId: string | undefined = id;

      if (isEditing || mode === 'single') {
        if (isEditing) {
          await transactionsService.update(id!, base);
          notification.success({ message: 'Despesa atualizada com sucesso!' });
        } else {
          const created = await transactionsService.create(base);
          firstTransactionId = created.id;
          notification.success({ message: 'Despesa registrada com sucesso!' });
        }
      } else if (mode === 'installment') {
        const { transactions } = await transactionsService.createBatch({
          ...base,
          groupType:        'INSTALLMENT',
          firstDate:        base.date,
          totalAmount:      parseCurrency(values.amount),
          installmentTotal,
        });
        firstTransactionId = transactions[0]?.id;
        notification.success({ message: `${installmentTotal} parcelas criadas com sucesso!` });
      } else {
        const { transactions } = await transactionsService.createBatch({
          ...base,
          groupType:           'RECURRING',
          firstDate:           base.date,
          recurrenceFrequency: values.recurrenceFrequency,
          recurrenceEndDate:   values.recurrenceEndDate?.toISOString(),
        });
        firstTransactionId = transactions[0]?.id;
        notification.success({ message: 'Lançamento recorrente criado com sucesso!' });
      }

      if (firstTransactionId && attachmentUploaderRef.current?.hasPending()) {
        await attachmentUploaderRef.current.uploadPending({ transactionId: firstTransactionId });
      }

      navigate('/finance/payables');
    } catch (error: any) {
      notification.error({ message: 'Erro', description: error.response?.data?.error ?? 'Erro ao salvar.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/payables')}
            className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white" />
          <Skeleton.Input active style={{ width: 240 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  const installmentAmount = installmentTotal > 0 ? totalAmount / installmentTotal : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/payables')}
          className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white" />
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            {isEditing ? 'Editar Conta' : 'Nova Conta a Pagar'}
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {isEditing ? 'Atualize os dados da despesa.' : 'Registre uma nova despesa, parcelamento ou recorrência.'}
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ status: 'PENDING' }}>
        <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
          bodyStyle={{ padding: '32px' }}>

          {/* TIPO DE LANÇAMENTO */}
          {!isEditing && (
            <>
              <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-3">Tipo de Lançamento</p>
              <div className="flex gap-2 mb-8 p-1 bg-dark-50 rounded-xl w-fit">
                {MODES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                      mode === opt.value
                        ? 'bg-dark-900 text-white shadow-md'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* DADOS BÁSICOS */}
          <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-4">Dados Básicos</p>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={<span className="font-bold text-dark-600">Descrição do Gasto</span>} name="title"
                rules={[{ required: true, message: 'O título é obrigatório' }]}>
                <Input size="large" placeholder="Ex: Aluguel Junho / Compra Equipamento" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Fornecedor / Favorecido</span>} name="provider">
                <Input size="large" prefix={<User size={16} className="text-dark-300" />}
                  placeholder="Nome da empresa ou pessoa" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">{mode === 'installment' ? 'Valor Total' : 'Valor'}</span>}
                name="amount" normalize={formatCurrency}
                rules={[{ required: true, message: 'O valor é obrigatório' }]}>
                <Input size="large" placeholder="R$ 0,00" className="rounded-xl font-bold text-dark-900" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Data de Vencimento</span>} name="date"
                rules={[{ required: true, message: 'Informe a data' }]}>
                <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" locale={ptBR.DatePicker} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Status</span>} name="status">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  options={[{ value: 'PENDING', label: 'Pendente' }, { value: 'PAID', label: 'Pago' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Forma de Pagamento</span>} name="paymentMethod">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione" allowClear>
                  {['PIX','Transferência Bancária','Boleto','Cartão de Débito','Cartão de Crédito','Dinheiro','Cheque']
                    .map((m) => <Select.Option key={m} value={m}>{m}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Plano de Contas</span>} name="accountPlanId">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione (opcional)" allowClear showSearch optionFilterProp="label"
                  options={accountPlans.map((p) => ({ value: p.id, label: `${p.code} – ${p.name}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Centro de Custo</span>} name="costCenterId">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione (opcional)" allowClear showSearch optionFilterProp="label"
                  options={costCenters.map((c) => ({ value: c.id, label: `${c.code} – ${c.name}` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Projeto Vinculado</span>} name="projectId">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione (opcional)" allowClear showSearch optionFilterProp="label"
                  options={projectOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Parceiro / Fornecedor</span>} name="personId">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  placeholder="Selecione (opcional)" allowClear showSearch optionFilterProp="label"
                  options={personOptions} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Relacionado a</span>}
                name="contextId"
                extra="A despesa permanece sendo do IIRes; o contexto apenas informa sua relação institucional."
              >
                <InstitutionalContextSelect size="large" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          {/* PARCELAMENTO */}
          {!isEditing && mode === 'installment' && (
            <>
              <Divider className="my-6" />
              <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-4">Configuração do Parcelamento</p>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div className="mb-4">
                    <p className="font-bold text-dark-600 text-sm mb-2">Número de Parcelas</p>
                    <InputNumber min={2} max={60} value={installmentTotal}
                      onChange={(v) => setInstallmentTotal(v ?? 2)}
                      size="large" className="w-full rounded-xl" />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Valor por Parcela</p>
                    <p className="text-2xl font-bold text-dark-900">{fmt(installmentAmount)}</p>
                    <p className="text-xs text-dark-400 mt-1">{installmentTotal}× parcelas mensais • Total: {fmt(totalAmount)}</p>
                  </div>
                </Col>
              </Row>
            </>
          )}

          {/* RECORRÊNCIA */}
          {!isEditing && mode === 'recurring' && (
            <>
              <Divider className="my-6" />
              <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-4">Configuração da Recorrência</p>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-bold text-dark-600">Frequência</span>} name="recurrenceFrequency"
                    rules={[{ required: true, message: 'Selecione a frequência' }]}>
                    <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione">
                      <Select.Option value="WEEKLY">Semanal</Select.Option>
                      <Select.Option value="MONTHLY">Mensal</Select.Option>
                      <Select.Option value="QUARTERLY">Trimestral</Select.Option>
                      <Select.Option value="ANNUALLY">Anual</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-bold text-dark-600">Data de Término (opcional)</span>} name="recurrenceEndDate">
                    <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY"
                      locale={ptBR.DatePicker} placeholder="Sem data fim → gera 12 meses" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {/* OBSERVAÇÕES E ANEXOS */}
          <Divider className="my-6" />
          <p className="text-[11px] font-bold text-dark-400 uppercase tracking-widest mb-4">Observações e Anexos</p>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={<span className="font-bold text-dark-600">Observações</span>} name="observations">
                <Input.TextArea rows={3} placeholder="Notas adicionais sobre este lançamento..." className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={<span className="font-bold text-dark-600">Anexos</span>}
                extra={<span className="text-xs text-dark-400">Máx 20 MB por arquivo · PDF, JPG, PNG, DOCX, XLSX</span>}>
                <AttachmentUploader ref={attachmentUploaderRef} transactionId={id} category="COMPROVANTE" />
              </Form.Item>
            </Col>
          </Row>

          {/* AÇÕES */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 mt-2">
            <Button size="large" onClick={() => navigate('/finance/payables')} className="rounded-xl">
              Cancelar
            </Button>
            <Button size="large" type="primary" htmlType="submit" loading={submitting}
              className="bg-primary-500 border-none rounded-xl font-bold px-8">
              {isEditing
                ? 'Atualizar Conta'
                : mode === 'single'
                  ? 'Salvar Conta'
                  : mode === 'installment'
                    ? `Criar ${installmentTotal} Parcelas`
                    : 'Criar Recorrências'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
