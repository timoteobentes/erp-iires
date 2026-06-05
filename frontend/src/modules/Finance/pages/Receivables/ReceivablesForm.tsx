import { useEffect, useState } from 'react';
import {
  Form, Input, Button, DatePicker, Select, Card, Row, Col,
  Skeleton, notification, InputNumber, Upload, Divider,
  type UploadFile,
} from 'antd';
import { ArrowLeft, User, Paperclip, Trash2, Repeat, CreditCard, Layers } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { transactionsService } from '../../services/transactions.service';
import { projectsService } from '../../../Projects/services/projects.service';
import { accountPlansService, type AccountPlan } from '../../services/accountPlans.service';
import { costCentersService, type CostCenter } from '../../services/costCenters.service';
import type { Attachment } from '../../services/transactions.service';

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

const MAX_FILE_SIZE  = 3 * 1024 * 1024;
const MAX_FILE_COUNT = 3;

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

async function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve({
      name:     file.name,
      mimeType: file.type,
      size:     file.size,
      data:     (e.target!.result as string).split(',')[1],
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Mode = 'single' | 'installment' | 'recurring';

const MODES: { value: Mode; label: string; icon: React.ReactNode }[] = [
  { value: 'single',      label: 'Único',      icon: <CreditCard size={14} /> },
  { value: 'installment', label: 'Parcelado',  icon: <Layers size={14} /> },
  { value: 'recurring',   label: 'Recorrente', icon: <Repeat size={14} /> },
];

// ──────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────

export default function ReceivablesForm() {
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
  const [accountPlans, setAccountPlans]         = useState<AccountPlan[]>([]);
  const [costCenters, setCostCenters]           = useState<CostCenter[]>([]);
  const [attachments, setAttachments]           = useState<Attachment[]>([]);
  const [fileList, setFileList]                 = useState<UploadFile[]>([]);

  // totalAmount derivado do valor normalizado do formulário
  const amountWatched = Form.useWatch('amount', form);
  const totalAmount   = parseCurrency(amountWatched ?? '');

  useEffect(() => {
    Promise.all([
      projectsService.list(),
      accountPlansService.list({ type: 'INCOME', active: true }),
      costCentersService.list(true),
    ]).then(([projects, plans, centers]) => {
      setProjectOptions(projects.map((p) => ({ value: p.id, label: p.name })));
      setAccountPlans(plans);
      setCostCenters(centers);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing && location.state) {
      const state = location.state as { payer?: string };
      if (state.payer) form.setFieldsValue({ payer: state.payer });
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
          payer:         t.description ?? '',
          amount:        formatCurrency(String(Math.round(t.amount * 100))),
          date:          t.date ? dayjs(t.date) : undefined,
          status:        t.status,
          paymentMethod: t.paymentMethod ?? undefined,
          accountPlanId: t.accountPlanId ?? undefined,
          costCenterId:  t.costCenterId  ?? undefined,
          observations:  t.observations  ?? '',
          projectId:     t.projectId     ?? undefined,
        });
        if (t.attachments && Array.isArray(t.attachments)) {
          const atts = t.attachments as Attachment[];
          setAttachments(atts);
          setFileList(atts.map((a, i) => ({ uid: String(i), name: a.name, status: 'done' as const })));
        }
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar os dados da receita.' });
        navigate('/finance/receivables');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [id, form, navigate]);

  const onFinish = async (values: any) => {
    const base = {
      type:          'INCOME' as const,
      title:         values.title,
      description:   values.payer  || undefined,
      amount:        parseCurrency(values.amount),
      date:          values.date ? values.date.toISOString() : new Date().toISOString(),
      status:        values.status  ?? 'PENDING',
      paymentMethod: values.paymentMethod || undefined,
      observations:  values.observations  || undefined,
      attachments:   attachments.length > 0 ? attachments : undefined,
      accountPlanId: values.accountPlanId || undefined,
      costCenterId:  values.costCenterId  || undefined,
      projectId:     values.projectId     || undefined,
    };

    try {
      setSubmitting(true);

      if (isEditing || mode === 'single') {
        if (isEditing) {
          await transactionsService.update(id!, base);
          notification.success({ message: 'Receita atualizada com sucesso!' });
        } else {
          await transactionsService.create(base);
          notification.success({ message: 'Receita registrada com sucesso!' });
        }
      } else if (mode === 'installment') {
        await transactionsService.createBatch({
          ...base,
          groupType:        'INSTALLMENT',
          firstDate:        base.date,
          totalAmount:      parseCurrency(values.amount),
          installmentTotal,
        });
        notification.success({ message: `${installmentTotal} recebimentos parcelados criados!` });
      } else {
        await transactionsService.createBatch({
          ...base,
          groupType:           'RECURRING',
          firstDate:           base.date,
          recurrenceFrequency: values.recurrenceFrequency,
          recurrenceEndDate:   values.recurrenceEndDate?.toISOString(),
        });
        notification.success({ message: 'Recebimento recorrente criado com sucesso!' });
      }

      navigate('/finance/receivables');
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
          <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/receivables')}
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
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/receivables')}
          className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white" />
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            {isEditing ? 'Editar Receita' : 'Nova Conta a Receber'}
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {isEditing ? 'Atualize os dados da receita.' : 'Registre uma nova receita, parcelamento ou recorrência.'}
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
              <Form.Item label={<span className="font-bold text-dark-600">Título / Descrição da Receita</span>} name="title"
                rules={[{ required: true, message: 'O título é obrigatório' }]}>
                <Input size="large" placeholder="Ex: Doação Campanha de Inverno" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Origem / Pagador</span>} name="payer">
                <Input size="large" prefix={<User size={16} className="text-dark-300" />}
                  placeholder="Nome da empresa, órgão ou doador" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-bold text-dark-600">{mode === 'installment' ? 'Valor Total' : 'Valor'}</span>}
                name="amount" normalize={formatCurrency}
                rules={[{ required: true, message: 'O valor é obrigatório' }]}>
                <Input size="large" placeholder="R$ 0,00" className="rounded-xl font-bold text-primary-600" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Data de Recebimento</span>} name="date"
                rules={[{ required: true, message: 'Informe a data' }]}>
                <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Status</span>} name="status">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  options={[{ value: 'PENDING', label: 'A Receber' }, { value: 'PAID', label: 'Recebido' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Forma de Recebimento</span>} name="paymentMethod">
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
                      placeholder="Sem data fim → gera 12 meses" />
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
                extra={<span className="text-xs text-dark-400">Máx 3 arquivos · 3 MB cada · PDF, JPG, PNG, DOCX, XLSX</span>}>
                <Upload
                  fileList={fileList}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                  beforeUpload={async (file) => {
                    if (attachments.length >= MAX_FILE_COUNT) {
                      notification.warning({ message: `Máximo de ${MAX_FILE_COUNT} arquivos.` });
                      return Upload.LIST_IGNORE;
                    }
                    if (file.size > MAX_FILE_SIZE) {
                      notification.warning({ message: 'Arquivo muito grande (máx 3 MB).' });
                      return Upload.LIST_IGNORE;
                    }
                    const att = await fileToAttachment(file);
                    setAttachments((prev) => [...prev, att]);
                    return false;
                  }}
                  onRemove={(file) => {
                    setAttachments((prev) => prev.filter((a) => a.name !== file.name));
                    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                  }}
                  onChange={({ fileList: fl }) => setFileList(fl)}
                >
                  <Button icon={<Paperclip size={15} />} className="rounded-xl">
                    Selecionar arquivo
                  </Button>
                </Upload>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 bg-dark-50 border border-dark-100 rounded-xl px-4 py-2.5">
                        <Paperclip size={13} className="text-dark-400 shrink-0" />
                        <span className="flex-1 text-sm font-bold text-dark-700 truncate">{a.name}</span>
                        <span className="text-xs text-dark-400 shrink-0">{(a.size / 1024).toFixed(0)} KB</span>
                        <button type="button" onClick={() => {
                          setAttachments((prev) => prev.filter((_, j) => j !== i));
                          setFileList((prev) => prev.filter((_, j) => j !== i));
                        }}>
                          <Trash2 size={14} className="text-dark-300 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* AÇÕES */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 mt-2">
            <Button size="large" onClick={() => navigate('/finance/receivables')} className="rounded-xl">
              Cancelar
            </Button>
            <Button size="large" type="primary" htmlType="submit" loading={submitting}
              className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold px-8">
              {isEditing
                ? 'Atualizar Receita'
                : mode === 'single'
                  ? 'Salvar Receita'
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
