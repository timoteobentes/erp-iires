import { useEffect, useMemo, useState } from 'react';
import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, notification } from 'antd';
import { Archive, Edit3, Plus, Search } from 'lucide-react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { teamService } from '../../People/services/team.service';
import { institutionalContextsService, type InstitutionalContext } from '../services/institutional-contexts.service';

const typeLabels: Record<string, string> = {
  INSTITUTIONAL: 'Institucional', STRATEGIC_PROJECT: 'Projeto estruturante', PARTNER_COMPANY: 'Empresa parceira',
  COMMUNITY: 'Comunidade', PROGRAM: 'Programa', AGREEMENT: 'Acordo de cooperação', PUBLIC_NOTICE: 'Edital',
  EVENT: 'Evento', RESEARCH_FRONT: 'Frente de pesquisa', SUPPORTED_INITIATIVE: 'Iniciativa apoiada',
  STRATEGIC_RELATIONSHIP: 'Relação estratégica',
};
const relationshipLabels: Record<string, string> = {
  INTERNAL: 'Interna', TECHNICAL_COOPERATION: 'Cooperação técnica', STRATEGIC_PARTNERSHIP: 'Parceria estratégica',
  SUPPORTED_INITIATIVE: 'Iniciativa apoiada', INCUBATED_INITIATIVE: 'Iniciativa incubada',
  RESEARCH_AND_DEVELOPMENT: 'Pesquisa e desenvolvimento', COMMERCIAL_RELATIONSHIP: 'Relação comercial',
};
const statusLabels: Record<string, string> = { ACTIVE: 'Ativo', PAUSED: 'Pausado', FINISHED: 'Finalizado', ARCHIVED: 'Arquivado' };
const statusColors: Record<string, string> = { ACTIVE: 'green', PAUSED: 'orange', FINISHED: 'blue', ARCHIVED: 'default' };

interface ContextFormValues {
  name: string;
  description?: string;
  type: InstitutionalContext['type'];
  relationship?: string;
  status: InstitutionalContext['status'];
  responsibleId?: string;
  period?: [Dayjs | null, Dayjs | null];
  notes?: string;
}

export default function InstitutionalContextsPage() {
  const [items, setItems] = useState<InstitutionalContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InstitutionalContext | null>(null);
  const [responsibles, setResponsibles] = useState<{ value: string; label: string }[]>([]);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { setItems(await institutionalContextsService.list()); }
    catch { notification.error({ message: 'Não foi possível carregar os contextos.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); teamService.list().then((u) => setResponsibles(u.map((x) => ({ value: x.id, label: x.name })))); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('pt-BR');
    return q ? items.filter((x) => `${x.name} ${x.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(q)) : items;
  }, [items, search]);

  const openForm = (item?: InstitutionalContext) => {
    setEditing(item ?? null);
    form.resetFields();
    form.setFieldsValue(item ? {
      ...item, period: [item.startDate ? dayjs(item.startDate) : null, item.endDate ? dayjs(item.endDate) : null],
    } : { status: 'ACTIVE' });
    setModalOpen(true);
  };

  const save = async (values: ContextFormValues) => {
    const payload = {
      name: values.name, description: values.description || null, type: values.type,
      relationship: values.relationship || null, status: values.status,
      responsibleId: values.responsibleId || null,
      startDate: values.period?.[0]?.toISOString() ?? null, endDate: values.period?.[1]?.toISOString() ?? null,
      notes: values.notes || null,
    };
    try {
      if (editing) await institutionalContextsService.update(editing.id, payload);
      else await institutionalContextsService.create(payload);
      notification.success({ message: editing ? 'Contexto atualizado.' : 'Contexto criado.' });
      setModalOpen(false); await load();
    } catch {
      notification.error({ message: 'Erro ao salvar contexto.' });
    }
  };

  const columns = [
    { title: 'Contexto', dataIndex: 'name', key: 'name', render: (name: string, item: InstitutionalContext) => <div><strong>{name}</strong><div className="text-xs text-dark-400">{item.responsible?.name ?? 'Sem responsável'}</div></div> },
    { title: 'Tipo', dataIndex: 'type', key: 'type', render: (value: string) => typeLabels[value] ?? value },
    { title: 'Relação com o IIRes', dataIndex: 'relationship', key: 'relationship', render: (value?: string) => value ? relationshipLabels[value] : '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (value: string) => <Tag color={statusColors[value]}>{statusLabels[value]}</Tag> },
    { title: 'Vínculos', key: 'links', render: (_: unknown, item: InstitutionalContext) => `${item._count?.projects ?? 0} projetos · ${item._count?.transactions ?? 0} lançamentos` },
    { title: '', key: 'actions', width: 110, render: (_: unknown, item: InstitutionalContext) => <Space><Button type="text" icon={<Edit3 size={16} />} onClick={() => openForm(item)} /><Popconfirm title="Arquivar este contexto?" onConfirm={async () => { await institutionalContextsService.archive(item.id); await load(); }}><Button type="text" danger icon={<Archive size={16} />} disabled={item.status === 'ARCHIVED'} /></Popconfirm></Space> },
  ];

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-dark-900">Contextos Institucionais</h1><p className="text-dark-400">Classifique iniciativas e relações sem separar a gestão do IIRes.</p></div><Button type="primary" icon={<Plus size={18} />} onClick={() => openForm()}>Novo contexto</Button></div>
    <Card className="rounded-2xl"><Input prefix={<Search size={17} />} allowClear placeholder="Buscar por nome ou descrição" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md mb-5" /><Table rowKey="id" loading={loading} dataSource={filtered} columns={columns} pagination={{ pageSize: 10 }} /></Card>
    <Modal title={editing ? 'Editar contexto institucional' : 'Novo contexto institucional'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Salvar" width={720} destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
        <Form.Item label="Nome" name="name" rules={[{ required: true, min: 2 }]}><Input maxLength={160} /></Form.Item>
        <Form.Item label="Descrição" name="description"><Input.TextArea rows={3} maxLength={5000} /></Form.Item>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4"><Form.Item label="Tipo" name="type" rules={[{ required: true }]}><Select options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))} /></Form.Item><Form.Item label="Relação com o IIRes" name="relationship"><Select allowClear options={Object.entries(relationshipLabels).map(([value, label]) => ({ value, label }))} /></Form.Item><Form.Item label="Status" name="status" rules={[{ required: true }]}><Select options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} /></Form.Item><Form.Item label="Responsável interno" name="responsibleId"><Select allowClear showSearch optionFilterProp="label" options={responsibles} /></Form.Item><Form.Item label="Período" name="period" className="md:col-span-2"><DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" /></Form.Item></div>
        <Form.Item label="Observações" name="notes"><Input.TextArea rows={3} maxLength={5000} /></Form.Item>
      </Form>
    </Modal>
  </div>;
}
