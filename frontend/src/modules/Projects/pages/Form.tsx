import { useEffect, useState } from 'react';
import ptBR from 'antd/locale/pt_BR';
import { Form, Input, Button, DatePicker, Select, Row, Col, Card, Skeleton, notification, InputNumber, Slider, Tag } from 'antd';
import { ArrowLeft, Briefcase, Users, AlignLeft, DollarSign, Handshake } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { projectsService } from '../services/projects.service';
import { teamService } from '../../People/services/team.service';
import { volunteersService } from '../../People/services/volunteers.service';
import { partnersService } from '../../People/services/partners.service';
import { donorsService } from '../../People/services/donors.service';
import { InstitutionalContextSelect } from '../../../components/InstitutionalContextSelect';

interface MemberOption {
  value: string;
  label: string;
  kind: 'user' | 'volunteer';
}

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [form] = Form.useForm();

  const [loadingData, setLoadingData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [leaderOptions, setLeaderOptions]   = useState<{ value: string; label: string }[]>([]);
  const [allMembers, setAllMembers]         = useState<MemberOption[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<{ value: string; label: string }[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ value: string; label: string }[]>([]);
  const [donorOptions, setDonorOptions]     = useState<{ value: string; label: string }[]>([]);

  const selectedLeader = Form.useWatch('managerId', form);

  const memberOptions = allMembers.filter((m) => m.value !== selectedLeader);

  // --------------------------------------------------------
  // Carrega opções para todos os selects
  // --------------------------------------------------------
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [teamData, volunteersData, partnersData, donorsData] = await Promise.all([
          teamService.list(),
          volunteersService.list(),
          partnersService.list(),
          donorsService.list(),
        ]);

        const activeTeam = teamData.filter((m) => m.status === 'ACTIVE');
        const activeVols = volunteersData.filter((v) => v.status === 'ACTIVE');

        setLeaderOptions(activeTeam.map((m) => ({ value: m.id, label: m.name })));

        setAllMembers([
          ...activeTeam.map((m) => ({ value: m.id, label: m.name, kind: 'user' as const })),
          ...activeVols.map((v) => ({ value: v.id, label: v.name, kind: 'volunteer' as const })),
        ]);

        setPartnerOptions(
          partnersData.filter((p) => p.status === 'ACTIVE' && p.partnershipType === 'Parceiro').map((p) => ({ value: p.id, label: p.name })),
        );
        setSupplierOptions(
          partnersData.filter((p) => p.status === 'ACTIVE' && p.partnershipType === 'Fornecedor').map((p) => ({ value: p.id, label: p.name })),
        );
        setDonorOptions(
          donorsData.filter((d) => d.status === 'ACTIVE').map((d) => ({ value: d.id, label: d.name })),
        );
      } catch {
        // silencia erro de carregamento de opções
      }
    };
    fetchOptions();
  }, []);

  // --------------------------------------------------------
  // Modo edição: carrega dados do projeto
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoadingData(true);
        const p = await projectsService.getById(id);

        const managerId = p.manager?.id ?? undefined;
        const allMemberIds = [
          ...(p.teamMembers ?? []).filter((m) => m.id !== managerId).map((m) => m.id),
          ...(p.volunteers  ?? []).map((v) => v.id),
        ];

        form.setFieldsValue({
          name: p.name,
          status: p.status,
          description: p.description ?? '',
          managerId,
          startDate: p.startDate ? dayjs(p.startDate) : undefined,
          endDate: p.endDate ? dayjs(p.endDate) : undefined,
          memberIds: allMemberIds,
          partnerTypeIds: (p.partners ?? []).filter((pt) => pt.partnershipType === 'Parceiro').map((pt) => pt.id),
          supplierTypeIds: (p.partners ?? []).filter((pt) => pt.partnershipType === 'Fornecedor').map((pt) => pt.id),
          donorIds: (p.donors ?? []).map((d) => d.id),
          budget: p.budget ?? undefined,
          progress: p.progress ?? 0,
          contextId: p.contextId ?? p.context?.id ?? undefined,
        });
      } catch {
        notification.error({
          message: 'Erro',
          description: 'Não foi possível carregar os dados do projeto.',
        });
        navigate('/projects');
      } finally {
        setLoadingData(false);
      }
    };

    fetchProject();
  }, [id, form, navigate]);

  // --------------------------------------------------------
  // Submit
  // --------------------------------------------------------
  const onFinish = async (values: any) => {
    const memberIds: string[] = values.memberIds ?? [];
    const kindMap = new Map(allMembers.map((m) => [m.value, m.kind]));

    const teamMemberIds = memberIds.filter((mid) => kindMap.get(mid) === 'user');
    const volunteerIds  = memberIds.filter((mid) => kindMap.get(mid) === 'volunteer');

    const partnerIds = [
      ...(values.partnerTypeIds ?? []),
      ...(values.supplierTypeIds ?? []),
    ];

    const payload = {
      name: values.name,
      description: values.description || '',
      status: values.status,
      managerId: values.managerId || undefined,
      startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : null,
      teamMemberIds,
      volunteerIds,
      partnerIds,
      donorIds: values.donorIds ?? [],
      budget: values.budget !== undefined && values.budget !== null ? Number(values.budget) : null,
      progress: values.progress ?? 0,
      contextId: values.contextId || null,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await projectsService.update(id!, payload);
        notification.success({ message: 'Sucesso', description: 'Projeto atualizado com sucesso!' });
      } else {
        await projectsService.create(payload);
        notification.success({ message: 'Sucesso', description: 'Projeto criado com sucesso!' });
      }
      navigate('/projects');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao salvar projeto. Tente novamente.';
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
            onClick={() => navigate('/projects')}
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
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/projects')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div>
            <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
              {isEditing ? 'Editar Projeto' : 'Criar Novo Projeto'}
            </h1>
            <p className="text-dark-400 text-sm">Preencha os dados abaixo para configurar a iniciativa.</p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100"
        requiredMark={false}
        initialValues={{ status: 'PLANNING' }}
      >
        {/* BLOCO 1: Informações Básicas */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Briefcase size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Informações Básicas</h2>
          </div>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Nome do Projeto</span>}
                name="name"
                rules={[{ required: true, message: 'O nome do projeto é obrigatório' }]}
              >
                <Input
                  size="large"
                  placeholder="Ex: Educação Sustentável"
                  className="rounded-xl hover:border-secondary-400 focus:border-secondary-500"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Status</span>}
                name="status"
              >
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl">
                  <Select.Option value="draft">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-dark-300" /> Rascunho
                    </div>
                  </Select.Option>
                  <Select.Option value="planning">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> Planejamento
                    </div>
                  </Select.Option>
                  <Select.Option value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-500" /> Em Andamento
                    </div>
                  </Select.Option>
                  <Select.Option value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary-500" /> Concluído
                    </div>
                  </Select.Option>
                  <Select.Option value="blocked">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> Bloqueado
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Relacionado a</span>}
                name="contextId"
                extra="Esta classificação não altera a titularidade: o projeto continua sendo do IIRes."
              >
                <InstitutionalContextSelect size="large" className="w-full" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Data de Início</span>}
                name="startDate"
              >
                <DatePicker
                  size="large"
                  className="w-full rounded-xl hover:border-secondary-400 focus:border-secondary-500"
                  format="DD/MM/YYYY"
                  locale={ptBR.DatePicker}
                  placeholder="Selecione a data"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Previsão de Término</span>}
                name="endDate"
              >
                <DatePicker
                  size="large"
                  className="w-full rounded-xl hover:border-secondary-400 focus:border-secondary-500"
                  format="DD/MM/YYYY"
                  locale={ptBR.DatePicker}
                  placeholder="Selecione a data"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 2: Membros do Projeto */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Users size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Membros do Projeto</h2>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Responsável (Líder)</span>}
                name="managerId"
                rules={[{ required: true, message: 'Selecione um responsável' }]}
              >
                <Select
                  size="large"
                  placeholder="Selecione o líder do projeto"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  showSearch
                  optionFilterProp="label"
                  options={leaderOptions}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Membros do Projeto</span>}
                name="memberIds"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Adicione equipe interna e voluntários"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  showSearch
                  optionFilterProp="label"
                  options={memberOptions}
                  optionRender={(opt) => {
                    const kind = (opt.data as MemberOption).kind;
                    return (
                      <div className="flex items-center justify-between gap-2">
                        <span>{opt.label}</span>
                        {kind === 'volunteer'
                          ? <Tag color="green" className="text-xs m-0">Voluntário</Tag>
                          : <Tag color="blue"  className="text-xs m-0">Equipe</Tag>}
                      </div>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 3: Parceiros, Fornecedores e Doadores */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Handshake size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Parceiros e Apoiadores</h2>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Parceiros</span>}
                name="partnerTypeIds"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Adicione parceiros ao projeto"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  showSearch
                  optionFilterProp="label"
                  options={partnerOptions}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Fornecedores</span>}
                name="supplierTypeIds"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Adicione fornecedores ao projeto"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  showSearch
                  optionFilterProp="label"
                  options={supplierOptions}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Doadores</span>}
                name="donorIds"
              >
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Adicione doadores ao projeto"
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  showSearch
                  optionFilterProp="label"
                  options={donorOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 4: Orçamento e Progresso */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <DollarSign size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Orçamento e Progresso</h2>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Orçamento Total (R$)</span>}
                name="budget"
              >
                <InputNumber
                  size="large"
                  min={0}
                  step={100}
                  precision={2}
                  className="w-full rounded-xl"
                  placeholder="Ex: 15000.00"
                  formatter={(v) => v ? `R$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  parser={(v) => (v ? v.replace(/R\$\s?|[.]/g, '').replace(',', '.') : '') as any}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Progresso Atual (%)</span>}
                name="progress"
              >
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                  tooltip={{ formatter: (v) => `${v}%` }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 5: Detalhamento */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <AlignLeft size={20} className="text-dark-400" />
            <h2 className="text-lg font-bold">Detalhamento</h2>
          </div>

          <Row>
            <Col span={24}>
              <Form.Item
                label={<span className="text-dark-600 font-medium">Descrição e Objetivos</span>}
                name="description"
              >
                <Input.TextArea
                  rows={5}
                  className="rounded-xl hover:border-secondary-400 focus:border-secondary-500 resize-none p-3"
                  placeholder="Descreva o impacto esperado, os beneficiários e o escopo geral deste projeto..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            size="large"
            onClick={() => navigate('/projects')}
            className="rounded-xl font-medium text-dark-600 border-dark-200 hover:text-dark-900 hover:bg-dark-50"
          >
            Cancelar
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft flex items-center"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
