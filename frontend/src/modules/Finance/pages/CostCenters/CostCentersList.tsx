import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, Modal, Form, Input, notification } from 'antd';
import { Plus, Pencil, PowerOff } from 'lucide-react';
import { costCentersService, type CostCenter } from '../../services/costCenters.service';

export default function CostCentersList() {
  const [centers, setCenters]       = useState<CostCenter[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<CostCenter | null>(null);
  const [saving, setSaving]         = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    costCentersService.list()
      .then(setCenters)
      .catch(() => notification.error({ message: 'Erro ao carregar centros de custo.' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: CostCenter) => {
    setEditing(c);
    form.setFieldsValue({ name: c.name, description: c.description });
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);
      if (editing) {
        await costCentersService.update(editing.id, values);
        notification.success({ message: 'Centro de custo atualizado!' });
      } else {
        await costCentersService.create(values);
        notification.success({ message: 'Centro de custo criado!' });
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
      await costCentersService.deactivate(id);
      notification.success({ message: 'Centro de custo desativado.' });
      load();
    } catch {
      notification.error({ message: 'Erro ao desativar.' });
    }
  };

  const columns = [
    { title: 'Código', dataIndex: 'code', key: 'code', width: 120, sorter: (a: CostCenter, b: CostCenter) => a.code.localeCompare(b.code) },
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Descrição', dataIndex: 'description', key: 'description', render: (v: string | null) => v ?? '—' },
    {
      title: 'Status', dataIndex: 'active', key: 'active', width: 90,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Ativo' : 'Inativo'}</Tag>,
    },
    {
      title: '', key: 'actions', width: 100,
      render: (_: any, r: CostCenter) => (
        <Space>
          <Button size="small" icon={<Pencil size={13} />} onClick={() => openEdit(r)} />
          {r.active && (
            <Popconfirm title="Desativar este centro de custo?" onConfirm={() => handleDeactivate(r.id)} okText="Sim" cancelText="Não">
              <Button size="small" danger icon={<PowerOff size={13} />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Centro de Custos</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gerencie os centros de custo para alocação de despesas e receitas.</p>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={openNew}
          className="bg-dark-900 border-none rounded-xl font-bold">
          Novo Centro
        </Button>
      </div>

      <Table
        dataSource={centers}
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
        title={<span className="font-bold text-dark-900">{editing ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</span>}
        width={440}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} className="pt-2">
          <Form.Item label={<span className="font-bold text-dark-600">Nome</span>} name="name"
            rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Ex: Projetos Sociais" className="rounded-xl" />
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
