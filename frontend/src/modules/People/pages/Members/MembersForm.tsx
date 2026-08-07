import { useEffect, useState } from 'react';
import ptBR from 'antd/locale/pt_BR';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import {
  Form, Input, Button, Select, Card, Row, Col, Divider,
  DatePicker, Checkbox, Skeleton, notification, Modal, Switch,
  InputNumber, Upload, Tag,
} from 'antd';
import {
  ArrowLeft, User, MapPin, Shield, Star, PhoneCall, ShieldCheck,
  Phone, Loader2, KeyRound, Copy, CheckCheck, FileText, Download,
  Banknote, Briefcase, Clock, Paperclip,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCep } from '../../hooks/useCep';
import { normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';
import { teamService }       from '../../services/team.service';
import { volunteersService } from '../../services/volunteers.service';

// ─── Opções ──────────────────────────────────────────────────

const BOND_OPTIONS = [
  { value: 'CLT',        label: 'CLT — Funcionário com carteira assinada' },
  { value: 'Prestador',  label: 'Prestador de Serviço' },
  { value: 'Estágio',    label: 'Estagiário' },
  { value: 'Voluntário', label: 'Voluntário' },
];

const LEVEL_OPTIONS = [
  { value: 'Diretor',     label: 'Diretor' },
  { value: 'Líder',       label: 'Líder / Coordenador' },
  { value: 'Operacional', label: 'Operacional / Funcionário' },
];

const GROUP_OPTIONS = [
  { value: 'Administrador', label: 'Administrador (Total)' },
  { value: 'Financeiro',    label: 'Financeiro' },
  { value: 'Inovação',      label: 'Inovação & Projetos' },
  { value: 'Tecnologia',    label: 'Tecnologia' },
  { value: 'Comercial',     label: 'Comercial / CRM' },
];

const CIVIL_OPTIONS = [
  { value: 'solteiro(a)',   label: 'Solteiro(a)' },
  { value: 'casado(a)',     label: 'Casado(a)' },
  { value: 'divorciado(a)', label: 'Divorciado(a)' },
  { value: 'viúvo(a)',      label: 'Viúvo(a)' },
  { value: 'outro',         label: 'Outro' },
];

const SKILLS_OPTIONS = [
  { value: 'Educação',    label: 'Educação e Mentoria' },
  { value: 'Artes',       label: 'Artes e Cultura' },
  { value: 'Saúde',       label: 'Saúde e Bem-estar' },
  { value: 'TI',          label: 'Tecnologia (TI)' },
  { value: 'Eventos',     label: 'Logística de Eventos' },
  { value: 'Comunicação', label: 'Marketing e Comunicação' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'Manhã',           label: 'Manhã' },
  { value: 'Tarde',           label: 'Tarde' },
  { value: 'Noite',           label: 'Noite' },
  { value: 'Flexível',        label: 'Horário Flexível' },
  { value: 'Final de Semana', label: 'Apenas Finais de Semana' },
];

const WORK_DAYS_OPTIONS = [
  { label: 'Seg', value: 'Segunda-feira' },
  { label: 'Ter', value: 'Terça-feira' },
  { label: 'Qua', value: 'Quarta-feira' },
  { label: 'Qui', value: 'Quinta-feira' },
  { label: 'Sex', value: 'Sexta-feira' },
  { label: 'Sáb', value: 'Sábado' },
  { label: 'Dom', value: 'Domingo' },
];

// ─── Utilitários ─────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const moneyFormatter = (v: number | string | undefined) =>
  v != null && v !== '' ? `R$ ${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
const moneyParser = (v: string | undefined) =>
  (v ? v.replace(/R\$\s?|[.]/g, '').replace(',', '.') : '') as any;

// ─── Modal de credenciais ─────────────────────────────────────

function CredentialsModal({ open, email, password, name, onClose }: {
  open: boolean; email: string; password: string; name: string; onClose: () => void;
}) {
  const [copiedEmail, setCopiedEmail]       = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const copy = (text: string, set: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => { set(true); setTimeout(() => set(false), 2000); });
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} okText="Entendido, fechar"
      cancelButtonProps={{ style: { display: 'none' } }} width={480} centered
      title={
        <div className="flex items-center gap-2 text-dark-900">
          <KeyRound size={20} className="text-primary-500" />
          <span className="font-bold">Colaborador criado — Credenciais de acesso</span>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <p className="text-dark-500 text-sm">
          <strong className="text-dark-800">{name}</strong> foi cadastrado com sucesso.
          Compartilhe as credenciais abaixo. Elas <strong>não poderão ser recuperadas</strong> depois desta tela.
        </p>
        <div className="rounded-xl border border-dark-100 bg-dark-50 p-4">
          <p className="text-[11px] font-bold text-dark-400 uppercase tracking-wider mb-1">E-mail de Login</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-dark-900">{email}</span>
            <Button type="text" size="small"
              icon={copiedEmail ? <CheckCheck size={16} className="text-secondary-500" /> : <Copy size={16} />}
              onClick={() => copy(email, setCopiedEmail)} className="text-dark-400 hover:text-primary-500 shrink-0" />
          </div>
        </div>
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
          <p className="text-[11px] font-bold text-primary-400 uppercase tracking-wider mb-1">Senha Temporária</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-bold text-primary-700 text-lg tracking-widest">{password}</span>
            <Button type="text" size="small"
              icon={copiedPassword ? <CheckCheck size={16} className="text-secondary-500" /> : <Copy size={16} />}
              onClick={() => copy(password, setCopiedPassword)} className="text-primary-400 hover:text-primary-600 shrink-0" />
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

// ─── Seção: Dados Bancários (reutilizável) ───────────────────

function BankSection() {
  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-dark-900">
        <Banknote size={20} className="text-secondary-500" />
        <h2 className="text-lg font-bold">Dados Bancários & PIX</h2>
      </div>
      <Row gutter={24}>
        <Col xs={24} md={10}>
          <Form.Item label={<span className="font-bold text-dark-600">Banco</span>} name="bankName">
            <Input size="large" className="rounded-xl" placeholder="Ex: Nubank, Bradesco, Caixa..." />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label={<span className="font-bold text-dark-600">Agência</span>} name="bankAgency">
            <Input size="large" className="rounded-xl" placeholder="0000" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label={<span className="font-bold text-dark-600">Conta</span>} name="bankAccount">
            <Input size="large" className="rounded-xl" placeholder="00000-0" />
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item label={<span className="font-bold text-dark-600">Chave PIX</span>} name="pixKey">
            <Input size="large" className="rounded-xl" placeholder="CPF, e-mail, telefone ou chave aleatória" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

// ─── Seção: Jornada (reutilizável) ──────────────────────────

function ScheduleSection() {
  return (
    <>
      <div className="flex items-center gap-2 mb-6 text-dark-900">
        <Clock size={20} className="text-primary-500" />
        <h2 className="text-lg font-bold">Jornada de Trabalho</h2>
      </div>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item label={<span className="font-bold text-dark-600">Dias da Semana</span>} name="workDays">
            <Checkbox.Group options={WORK_DAYS_OPTIONS} className="flex flex-wrap gap-y-2" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label={<span className="font-bold text-dark-600">Horário</span>} name="workHours">
            <Input size="large" className="rounded-xl" placeholder="Ex: 08h às 14h" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

// ─── Seção: Documentos (reutilizável) ───────────────────────

function DocumentsSection({ fileList, onAdd, onRemove }: {
  fileList: UploadFile[];
  onAdd: (file: RcFile) => void;
  onRemove: (file: UploadFile) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4 text-dark-900">
        <Paperclip size={20} className="text-dark-400" />
        <h2 className="text-lg font-bold">Documentos Anexados</h2>
      </div>
      <p className="text-xs text-dark-400 mb-4">
        Anexe documentos como contrato, RG, CNH, comprovante de endereço, etc. Aceita PDF, imagens e Word.
      </p>
      <Upload
        listType="text"
        fileList={fileList}
        beforeUpload={(file: RcFile) => { onAdd(file); return false; }}
        onRemove={onRemove}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        multiple
      >
        <Button icon={<Paperclip size={16} />} className="rounded-xl border-dashed border-dark-300">
          Selecionar Arquivos
        </Button>
      </Upload>
    </>
  );
}

// ─── Componente Principal ─────────────────────────────────────

export default function MembersForm() {
  const navigate = useNavigate();
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const isEditing = !!id;
  const [form] = Form.useForm();
  const { loadingCep, handleCEPBlur } = useCep(form);

  const [bondType, setBondType]   = useState<string>(
    kind === 'volunteer' ? 'Voluntário' : kind === 'user' ? 'CLT' : ''
  );
  const [loadingData, setLoadingData]   = useState(isEditing);
  const [submitting, setSubmitting]     = useState(false);
  const [supervisorOptions, setSupervisorOptions] = useState<{ value: string; label: string }[]>([]);
  const [downloadingTermo, setDownloadingTermo]   = useState(false);
  const [credModal, setCredModal]       = useState({ open: false, email: '', password: '', name: '' });
  const [createdVolunteerId, setCreatedVolunteerId]     = useState<string | null>(null);
  const [createdVolunteerName, setCreatedVolunteerName] = useState('');
  const [documentFiles, setDocumentFiles] = useState<UploadFile[]>([]);

  const isVolunteer  = bondType === 'Voluntário';
  const isCLT        = bondType === 'CLT';
  const isPrestador  = bondType === 'Prestador';
  const isEstagio    = bondType === 'Estágio';
  const isSystemUser = isCLT || isPrestador || isEstagio;

  // ── Carrega supervisores ─────────────────────────────────
  useEffect(() => {
    teamService.list().then((data) => {
      setSupervisorOptions(
        data.filter((m) => m.status === 'ACTIVE').map((m) => ({ value: m.id, label: m.name }))
      );
    }).catch(() => {});
  }, []);

  // ── Modo edição: carrega dados ───────────────────────────
  useEffect(() => {
    if (!id || !kind) return;

    const fetch = async () => {
      try {
        setLoadingData(true);
        if (kind === 'user') {
          const m = await teamService.getById(id);
          setBondType(m.bondType || 'CLT');
          form.setFieldsValue({
            bondType:         m.bondType || 'CLT',
            name:             m.name,
            email:            m.email,
            personal_email:   m.personalEmail  ?? '',
            cpf:              normalizeCPF(m.cpf ?? ''),
            phone:            normalizePhone(m.phone ?? ''),
            birthDate:        m.birthDate ? dayjs(m.birthDate) : undefined,
            rg:               m.rg           ?? '',
            nationality:      m.nationality  ?? '',
            maritalStatus:    m.maritalStatus ?? undefined,
            role:             m.role  ?? '',
            level:            m.level ?? undefined,
            group:            m.group ?? undefined,
            pis:              m.pis              ?? '',
            voterRegistration:m.voterRegistration ?? '',
            hasCnpj:          m.hasCnpj   ?? false,
            cnpjNumber:       m.cnpjNumber ?? '',
            issuesInvoice:    m.issuesInvoice ?? false,
            bankName:         m.bankName    ?? '',
            bankAgency:       m.bankAgency  ?? '',
            bankAccount:      m.bankAccount ?? '',
            pixKey:           m.pixKey      ?? '',
            salary:           m.salary ?? undefined,
            workDays:         m.workDays  ?? [],
            workHours:        m.workHours ?? '',
            cep:              normalizeCEP(m.address?.cep ?? ''),
            address:          m.address?.street       ?? '',
            number:           m.address?.number       ?? '',
            neighborhood:     m.address?.neighborhood ?? '',
            city:             m.address?.city         ?? '',
            state:            m.address?.state        ?? '',
          });
          if (Array.isArray(m.documents) && m.documents.length > 0) {
            setDocumentFiles(
              m.documents.map((d: any, i: number) => ({
                uid: String(i), name: d.name, status: 'done' as const, url: d.data,
              }))
            );
          }
        } else {
          const v = await volunteersService.getById(id);
          setBondType('Voluntário');
          form.setFieldsValue({
            bondType:       'Voluntário',
            name:           v.name,
            email:          v.email          ?? '',
            cpf:            normalizeCPF(v.cpf ?? ''),
            phone:          normalizePhone(v.phone ?? ''),
            birthDate:      v.birthDate ? dayjs(v.birthDate) : undefined,
            rg:             v.rg           ?? '',
            nationality:    v.nationality  ?? '',
            maritalStatus:  v.maritalStatus ?? undefined,
            role:           v.role  ?? '',
            level:          v.level ?? undefined,
            group:          v.group ?? undefined,
            profession:     v.profession    ?? '',
            supervisorId:   v.supervisorId  ?? undefined,
            services:       v.services      ?? '',
            workDays:       v.workDays      ?? [],
            workHours:      v.workHours     ?? '',
            skills:         v.skills        ?? [],
            availability:   v.availability  ?? undefined,
            emergencyName:  v.emergencyName ?? '',
            emergencyPhone: normalizePhone(v.emergencyPhone ?? ''),
            acceptedTerms:  v.acceptedTerms,
            cep:            normalizeCEP(v.address?.cep ?? ''),
            address:        v.address?.street       ?? '',
            number:         v.address?.number       ?? '',
            neighborhood:   v.address?.neighborhood ?? '',
            city:           v.address?.city         ?? '',
            state:          v.address?.state        ?? '',
          });
          if (Array.isArray(v.documents) && v.documents.length > 0) {
            setDocumentFiles(
              v.documents.map((d: any, i: number) => ({
                uid: String(i), name: d.name, status: 'done' as const, url: d.data,
              }))
            );
          }
        }
      } catch {
        notification.error({ message: 'Erro', description: 'Não foi possível carregar os dados.' });
        navigate('/people/members');
      } finally {
        setLoadingData(false);
      }
    };

    fetch();
  }, [id, kind, form, navigate]);

  // ── Submit ───────────────────────────────────────────────
  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);

      // Processa documentos
      const processedDocs = await Promise.all(
        documentFiles
          .filter((f) => f.originFileObj)
          .map(async (f) => {
            const data = await fileToBase64(f.originFileObj as File);
            return { name: f.name, type: (f.originFileObj as File).type, size: (f.originFileObj as File).size, data };
          })
      );
      // Mantém docs já existentes (sem originFileObj) + novos convertidos
      const existingDocs = documentFiles.filter((f) => !f.originFileObj && f.url)
        .map((f) => ({ name: f.name, data: f.url }));
      const allDocs = [...existingDocs, ...processedDocs];

      if (isVolunteer) {
        const payload = {
          ...values,
          cpf:            stripMask(values.cpf),
          phone:          stripMask(values.phone),
          emergencyPhone: stripMask(values.emergencyPhone),
          cep:            stripMask(values.cep),
          birthDate:      values.birthDate ? values.birthDate.toISOString() : null,
          workDays:       values.workDays ?? [],
          documents:      allDocs.length > 0 ? allDocs : undefined,
        };
        delete payload.bondType;

        if (isEditing) {
          await volunteersService.update(id!, payload);
          notification.success({ message: 'Sucesso', description: 'Voluntário atualizado com sucesso!' });
          navigate('/people/members');
        } else {
          const res = await volunteersService.create(payload);
          setCreatedVolunteerId(res.volunteer.id);
          setCreatedVolunteerName(res.volunteer.name);
          notification.success({
            message: 'Voluntário cadastrado!',
            description: 'Use o botão abaixo para baixar o Termo de Adesão.',
            duration: 8,
          });
        }
      } else {
        const payload = {
          ...values,
          cpf:      stripMask(values.cpf),
          phone:    stripMask(values.phone),
          cep:      stripMask(values.cep),
          birthDate:values.birthDate ? values.birthDate.toISOString() : null,
          salary:   values.salary != null ? Number(values.salary) : null,
          workDays: values.workDays ?? [],
          documents:allDocs.length > 0 ? allDocs : undefined,
        };

        if (isEditing) {
          await teamService.update(id!, payload);
          notification.success({ message: 'Sucesso', description: 'Colaborador atualizado com sucesso!' });
          navigate('/people/members');
        } else {
          const res = await teamService.create(payload);
          setCredModal({ open: true, email: values.email, password: res.temporaryPassword ?? '', name: values.name });
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar. Tente novamente.';
      notification.error({ message: 'Erro', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTermo = async () => {
    if (!createdVolunteerId) return;
    try {
      setDownloadingTermo(true);
      await volunteersService.downloadTermo(createdVolunteerId, createdVolunteerName);
      navigate('/people/members');
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível gerar o Termo de Adesão.' });
    } finally {
      setDownloadingTermo(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/people/members')}
            className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" />
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
      <CredentialsModal
        open={credModal.open} email={credModal.email} password={credModal.password} name={credModal.name}
        onClose={() => { setCredModal((s) => ({ ...s, open: false })); navigate('/people/members'); }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/people/members')}
          className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all" />
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
            {isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h1>
          <p className="text-dark-400 text-sm">Preencha os dados do colaborador.</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}
        className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">

        {/* ── 1. Tipo de Vínculo ── */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '28px 32px' }}>
          <div className="flex items-center gap-2 mb-5 text-dark-900">
            <Shield size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Tipo de Vínculo</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={10}>
              <Form.Item
                label={<span className="font-bold text-dark-600">Vínculo com a IIRes <span className="text-red-500">*</span></span>}
                name="bondType"
                rules={[{ required: true, message: 'Selecione o tipo de vínculo' }]}
              >
                <Select size="large" placeholder="Selecione o vínculo"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  options={BOND_OPTIONS} disabled={isEditing}
                  onChange={(val) => setBondType(val)} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {bondType && (
          <>
            {/* ── 2. Informações Pessoais ── */}
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <div className="flex items-center gap-2 mb-6 text-dark-900">
                <User size={20} className="text-primary-500" />
                <h2 className="text-lg font-bold">Informações Pessoais</h2>
              </div>
              <Row gutter={24}>
                <Col xs={24} md={16}>
                  <Form.Item
                    label={<span className="font-bold text-dark-600">Nome Completo <span className="text-red-500">*</span></span>}
                    name="name" rules={[{ required: true, message: 'O nome é obrigatório' }]}
                  >
                    <Input size="large" className="rounded-xl" placeholder="Nome completo" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">Data de Nascimento</span>} name="birthDate">
                    <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY"
                      locale={ptBR.DatePicker} placeholder="DD/MM/AAAA" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">CPF</span>} name="cpf" normalize={normalizeCPF}>
                    <Input size="large" className="rounded-xl" placeholder="000.000.000-00"
                      disabled={isEditing && isVolunteer} />
                  </Form.Item>
                  {isEditing && isVolunteer && (
                    <p className="text-[11px] text-dark-400 -mt-4 mb-4">O CPF não pode ser alterado.</p>
                  )}
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">RG / Identidade</span>} name="rg">
                    <Input size="large" className="rounded-xl" placeholder="Nº do documento" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">Nacionalidade</span>} name="nationality">
                    <Input size="large" className="rounded-xl" placeholder="Ex: brasileiro(a)" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">Estado Civil</span>} name="maritalStatus">
                    <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                      placeholder="Selecione" options={CIVIL_OPTIONS} allowClear />
                  </Form.Item>
                </Col>
                {isVolunteer && (
                  <Col xs={24} md={16}>
                    <Form.Item label={<span className="font-bold text-dark-600">Profissão / Ocupação Atual</span>} name="profession">
                      <Input size="large" className="rounded-xl" placeholder="Ex: Estudante, Engenheiro..." />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Contato */}
              <Divider className="my-8" />
              <div className="flex items-center gap-2 mb-6 text-dark-900">
                <Phone size={20} className="text-secondary-500" />
                <h2 className="text-lg font-bold">Contato</h2>
              </div>
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item label={<span className="font-bold text-dark-600">Celular / WhatsApp</span>}
                    name="phone" normalize={normalizePhone}>
                    <Input size="large" prefix={<Phone size={16} className="text-dark-300" />}
                      className="rounded-xl" placeholder="(00) 00000-0000" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    label={<span className="font-bold text-dark-600">{isSystemUser ? 'E-mail Pessoal' : 'E-mail de Contato'}</span>}
                    name={isSystemUser ? 'personal_email' : 'email'}
                    rules={[{ type: 'email', message: 'Formato inválido' }]}
                  >
                    <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Endereço */}
              <Divider className="my-8" />
              <div className="flex items-center gap-2 mb-6 text-dark-900">
                <MapPin size={20} className="text-secondary-500" />
                <h2 className="text-lg font-bold">Endereço</h2>
              </div>
              <Row gutter={24}>
                <Col xs={24} md={6}>
                  <Form.Item label={<span className="font-bold text-dark-600">CEP</span>} name="cep" normalize={normalizeCEP}>
                    <Input size="large" className="rounded-xl" placeholder="00000-000" onBlur={handleCEPBlur}
                      suffix={loadingCep && <Loader2 size={16} className="animate-spin text-primary-500" />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-bold text-dark-600">Logradouro</span>} name="address">
                    <Input size="large" className="rounded-xl" placeholder="Rua, Avenida..." />
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

            {/* ── 3. Cargo & Acesso ── */}
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <div className="flex items-center gap-2 mb-6 text-dark-900">
                <Briefcase size={20} className="text-warning" />
                <h2 className="text-lg font-bold">Cargo & Perfil Organizacional</h2>
              </div>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-bold text-dark-600">Cargo / Função</span>} name="role">
                    <Input size="large" className="rounded-xl" placeholder="Ex: Analista de TI" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span className="font-bold text-dark-600">Nível Hierárquico</span>} name="level">
                    <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                      placeholder="Selecione o nível" options={LEVEL_OPTIONS} allowClear />
                  </Form.Item>
                </Col>

                {isSystemUser && (
                  <>
                    <Col span={24}><Divider className="my-2" /></Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">E-mail de Login (Corporativo) <span className="text-red-500">*</span></span>}
                        name="email"
                        rules={[{ required: true, message: 'O e-mail é obrigatório' }, { type: 'email', message: 'Formato inválido' }]}
                      >
                        <Input size="large" className="rounded-xl" placeholder="login@iires.org" disabled={isEditing} />
                      </Form.Item>
                      {isEditing && <p className="text-[11px] text-dark-400 -mt-4 mb-4">O e-mail de login não pode ser alterado.</p>}
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Grupo de Acesso <span className="text-red-500">*</span></span>}
                        name="group"
                        rules={[{ required: true, message: 'Selecione o grupo de acesso' }]}
                      >
                        <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                          placeholder="Selecione o grupo" options={GROUP_OPTIONS} />
                      </Form.Item>
                    </Col>
                    {!isEditing && (
                      <Col span={24}>
                        <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 flex items-start gap-3">
                          <KeyRound size={18} className="text-dark-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-dark-500">
                            Uma <strong className="text-dark-700">senha temporária única</strong> será gerada automaticamente e exibida somente uma vez.
                          </p>
                        </div>
                      </Col>
                    )}
                  </>
                )}

                {isVolunteer && (
                  <Col xs={24} md={12}>
                    <Form.Item label={<span className="font-bold text-dark-600">Área / Grupo</span>} name="group">
                      <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                        placeholder="Área de atuação" options={GROUP_OPTIONS} allowClear />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Card>

            {/* ── 4a. Dados Específicos CLT ── */}
            {isCLT && (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                <div className="flex items-center gap-2 mb-6 text-dark-900">
                  <Shield size={20} className="text-blue-500" />
                  <h2 className="text-lg font-bold">Dados Contratuais — CLT</h2>
                </div>
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="font-bold text-dark-600">PIS / PASEP</span>} name="pis">
                      <Input size="large" className="rounded-xl" placeholder="000.00000.00-0" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="font-bold text-dark-600">Nº Título de Eleitor</span>} name="voterRegistration">
                      <Input size="large" className="rounded-xl" placeholder="0000 0000 0000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="font-bold text-dark-600">Salário (R$)</span>} name="salary">
                      <InputNumber size="large" className="w-full rounded-xl" min={0} step={100} precision={2}
                        placeholder="0,00" formatter={moneyFormatter} parser={moneyParser} />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider className="my-6" />
                <BankSection />
              </Card>
            )}

            {/* ── 4b. Dados Específicos Prestador ── */}
            {isPrestador && (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                <div className="flex items-center gap-2 mb-6 text-dark-900">
                  <Shield size={20} className="text-purple-500" />
                  <h2 className="text-lg font-bold">Dados Contratuais — Prestador de Serviço</h2>
                </div>
                <Row gutter={24}>
                  <Col xs={24} md={6}>
                    <Form.Item label={<span className="font-bold text-dark-600">Possui CNPJ?</span>} name="hasCnpj" valuePropName="checked">
                      <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                    </Form.Item>
                  </Col>
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasCnpj !== cur.hasCnpj}>
                    {({ getFieldValue }) => getFieldValue('hasCnpj') && (
                      <Col xs={24} md={12}>
                        <Form.Item label={<span className="font-bold text-dark-600">CNPJ</span>} name="cnpjNumber">
                          <Input size="large" className="rounded-xl" placeholder="00.000.000/0000-00" />
                        </Form.Item>
                      </Col>
                    )}
                  </Form.Item>
                  <Col xs={24} md={6}>
                    <Form.Item label={<span className="font-bold text-dark-600">Emite NF / Recibo?</span>} name="issuesInvoice" valuePropName="checked">
                      <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="font-bold text-dark-600">Valor do Serviço (R$)</span>} name="salary">
                      <InputNumber size="large" className="w-full rounded-xl" min={0} step={100} precision={2}
                        placeholder="0,00" formatter={moneyFormatter} parser={moneyParser} />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider className="my-6" />
                <BankSection />
              </Card>
            )}

            {/* ── 4c. Dados Estágio ── */}
            {isEstagio && (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                <div className="flex items-center gap-2 mb-6 text-dark-900">
                  <Shield size={20} className="text-orange-500" />
                  <h2 className="text-lg font-bold">Dados de Estágio</h2>
                </div>
                <ScheduleSection />
                <Divider className="my-6" />
                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span className="font-bold text-dark-600">Bolsa-Auxílio (R$)</span>} name="salary">
                      <InputNumber size="large" className="w-full rounded-xl" min={0} step={50} precision={2}
                        placeholder="0,00" formatter={moneyFormatter} parser={moneyParser} />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider className="my-6" />
                <BankSection />
              </Card>
            )}

            {/* ── 4d. Contrato Voluntário ── */}
            {isVolunteer && (
              <>
                <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                  <div className="flex items-center gap-2 mb-6 text-dark-900">
                    <FileText size={20} className="text-secondary-500" />
                    <h2 className="text-lg font-bold">Contrato de Voluntariado</h2>
                  </div>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Supervisor Responsável <span className="text-red-500">*</span></span>}
                        name="supervisorId"
                        rules={[{ required: true, message: 'Selecione o supervisor' }]}
                      >
                        <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                          placeholder="Selecione o supervisor" showSearch optionFilterProp="label"
                          options={supervisorOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label={<span className="font-bold text-dark-600">Atividades a Serem Desenvolvidas</span>} name="services">
                        <Input.TextArea rows={3} className="rounded-xl resize-none"
                          placeholder="Descreva as atividades que o voluntário irá realizar..." />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-6" />
                  <ScheduleSection />
                </Card>

                <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                  <div className="flex items-center gap-2 mb-6 text-dark-900">
                    <Star size={20} className="text-warning" />
                    <h2 className="text-lg font-bold">Engajamento & Habilidades</h2>
                  </div>
                  <Row gutter={24}>
                    <Col xs={24} md={16}>
                      <Form.Item label={<span className="font-bold text-dark-600">Áreas de Interesse / Habilidades</span>} name="skills">
                        <Select mode="multiple" size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                          placeholder="Selecione as áreas" options={SKILLS_OPTIONS} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<span className="font-bold text-dark-600">Flexibilidade de Horário</span>} name="availability">
                        <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                          placeholder="Melhor turno" options={AVAILABILITY_OPTIONS} allowClear />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-8" />
                  <div className="flex items-center gap-2 mb-6 text-dark-900">
                    <PhoneCall size={20} className="text-red-500" />
                    <h2 className="text-lg font-bold">Contato de Emergência</h2>
                  </div>
                  <Row gutter={24}>
                    <Col xs={24} md={16}>
                      <Form.Item label={<span className="font-bold text-dark-600">Nome do Contato</span>} name="emergencyName">
                        <Input size="large" className="rounded-xl" placeholder="Quem devemos avisar em caso de emergência?" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<span className="font-bold text-dark-600">Telefone de Emergência</span>}
                        name="emergencyPhone" normalize={normalizePhone}>
                        <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-8" />
                  <div className="flex items-center gap-2 mb-6 text-dark-900">
                    <ShieldCheck size={20} className="text-primary-600" />
                    <h2 className="text-lg font-bold">Documentação Legal</h2>
                  </div>
                  <Form.Item
                    name="acceptedTerms" valuePropName="checked"
                    rules={[{ validator: (_, v) => v ? Promise.resolve() : Promise.reject('O aceite é obrigatório') }]}
                  >
                    <Checkbox className="text-dark-600 font-medium">
                      Confirmo que as condições do voluntariado foram apresentadas e o voluntário concorda em assinar o{' '}
                      <strong>Termo de Adesão ao Trabalho Voluntário</strong>.
                    </Checkbox>
                  </Form.Item>
                </Card>
              </>
            )}

            {/* ── 5. Documentos (todos os vínculos) ── */}
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <DocumentsSection
                fileList={documentFiles}
                onAdd={(file) => {
                  setDocumentFiles((prev) => [
                    ...prev,
                    { uid: file.uid, name: file.name, status: 'done', originFileObj: file },
                  ]);
                }}
                onRemove={(file) => {
                  setDocumentFiles((prev) => prev.filter((f) => f.uid !== file.uid));
                }}
              />
              {documentFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {documentFiles.map((f) => (
                    <Tag key={f.uid} className="rounded-lg text-xs px-3 py-1 bg-dark-50 border-dark-200">
                      {f.name}
                    </Tag>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button size="large" onClick={() => navigate('/people/members')}
            className="rounded-xl font-medium text-dark-600 border-dark-200 hover:text-dark-900 hover:bg-dark-50">
            Cancelar
          </Button>

          {createdVolunteerId && (
            <Button size="large" icon={<Download size={18} />} loading={downloadingTermo}
              onClick={handleDownloadTermo}
              className="bg-secondary-500 hover:!bg-secondary-600 text-white border-none rounded-xl font-bold shadow-soft flex items-center">
              Baixar Termo de Adesão
            </Button>
          )}

          {!createdVolunteerId && (
            <Button size="large" type="primary" htmlType="submit" loading={submitting}
              className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft flex items-center">
              {isEditing ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
