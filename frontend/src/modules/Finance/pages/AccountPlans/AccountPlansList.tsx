import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, Modal, Form, Input, Select, notification } from 'antd';
import { Plus, Pencil, PowerOff } from 'lucide-react';
import { accountPlansService, type AccountPlan } from '../../services/accountPlans.service';

function computeNextCode(parentId: string, plans: AccountPlan[]): string {
  const parent = plans.find((p) => p.id === parentId);
  if (!parent) return '';
  const children = plans.filter((p) => p.parentId === parentId);
  if (children.length === 0) return `${parent.code}.1`;
  const maxSuffix = Math.max(
    ...children.map((c) => {
      const parts = c.code.split('.');
      return parseInt(parts[parts.length - 1], 10) || 0;
    }),
  );
  return `${parent.code}.${maxSuffix + 1}`;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  INCOME:  { label: 'Receita',  color: 'green'  },
  EXPENSE: { label: 'Despesa',  color: 'red'    },
  BOTH:    { label: 'Ambos',    color: 'blue'   },
};

export default function AccountPlansList() {
  const [plans, setPlans]           = useState<AccountPlan[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<AccountPlan | null>(null);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    accountPlansService.list()
      .then(setPlans)
      .catch(() => notification.error({ message: 'Erro ao carregar planos de contas.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (p: AccountPlan) => {
    setEditing(p);
    form.setFieldsValue({ code: p.code, name: p.name, type: p.type, parentId: p.parentId, description: p.description });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      if (editing) {
        await accountPlansService.update(editing.id, values);
        notification.success({ message: 'Plano atualizado!' });
      } else {
        await accountPlansService.create(values);
        notification.success({ message: 'Plano criado!' });
      }
      setModalOpen(false);
      load();
    } catch (error: any) {
      notification.error({ message: 'Erro', description: error.response?.data?.error ?? 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await accountPlansService.deactivate(id);
      notification.success({ message: 'Plano desativado.' });
      load();
    } catch {
      notification.error({ message: 'Erro ao desativar plano.' });
    }
  };

  const columns = [
    { title: 'Código', dataIndex: 'code', key: 'code', width: 100, sorter: (a: AccountPlan, b: AccountPlan) => a.code.localeCompare(b.code) },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    {
      title: 'Tipo', dataIndex: 'type', key: 'type', width: 110,
      render: (t: string) => <Tag color={TYPE_LABELS[t]?.color}>{TYPE_LABELS[t]?.label ?? t}</Tag>,
    },
    {
      title: 'Conta Pai', key: 'parent',
      render: (_: any, r: AccountPlan) => r.parent ? `${r.parent.code} – ${r.parent.name}` : '—',
    },
    {
      title: 'Status', dataIndex: 'active', key: 'active', width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag>,
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_: any, r: AccountPlan) => (
        <Space>
          <Button size="small" icon={<Pencil size={13} />} onClick={() => openEdit(r)} />
          {r.active && (
            <Popconfirm title="Desativar este plano?" onConfirm={() => handleDeactivate(r.id)} okText="Sim" cancelText="Não">
              <Button size="small" danger icon={<PowerOff size={13} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const parentOptions = plans.filter((p) => p.active && p.id !== editing?.id)
    .map((p) => ({ value: p.id, label: `${p.code} – ${p.name}` }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Plano de Contas</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gerencie a classificação contábil das receitas e despesas.</p>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={openNew}
          className="bg-dark-900 border-none rounded-xl font-bold">
          Novo Plano
        </Button>
      </div>

      <Table
        dataSource={plans}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        className="rounded-2xl shadow-soft border-dark-100 bg-white"
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={<span className="font-bold text-dark-900">{editing ? 'Editar Plano' : 'Novo Plano de Contas'}</span>}
        width={480}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} className="pt-2">
          <Form.Item label={<span className="font-bold text-dark-600">Código</span>} name="code"
            rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Ex: 1.1.01" className="rounded-xl" />
          </Form.Item>
          <Form.Item label={<span className="font-bold text-dark-600">Nome</span>} name="name"
            rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Ex: Doações Pessoa Física" className="rounded-xl" />
          </Form.Item>
          <Form.Item label={<span className="font-bold text-dark-600">Tipo</span>} name="type"
            rules={[{ required: true, message: 'Selecione o tipo' }]}>
            <Select className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione">
              <Select.Option value="INCOME">Receita</Select.Option>
              <Select.Option value="EXPENSE">Despesa</Select.Option>
              <Select.Option value="BOTH">Ambos</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={<span className="font-bold text-dark-600">Conta Pai (opcional)</span>} name="parentId">
            <Select
              className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
              placeholder="Sem pai (conta raiz)"
              allowClear showSearch optionFilterProp="label"
              options={parentOptions}
              onChange={(val) => {
                if (val && !editing) {
                  form.setFieldValue('code', computeNextCode(val, plans));
                } else if (!val && !editing) {
                  form.setFieldValue('code', '');
                }
              }}
            />
          </Form.Item>
          <Form.Item label={<span className="font-bold text-dark-600">Descrição</span>} name="description">
            <Input.TextArea rows={2} className="rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={saving}
              className="bg-dark-900 border-none rounded-xl font-bold">
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
