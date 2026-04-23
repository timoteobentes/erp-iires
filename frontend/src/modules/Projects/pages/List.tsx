import React from 'react';
import { Table, Button, Input, Tag, Modal, Radio, Space } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface Project {
  id: string;
  name: string;
  manager: string;
  startDate: string;
  budget: string;
  status: 'active' | 'completed' | 'blocked';
}

const mockData: Project[] = [
  { id: '1', name: 'Inovação Verde', manager: 'Ana Silva', startDate: '10/01/2026', budget: 'R$ 150.000', status: 'active' },
  { id: '2', name: 'Educação Tech', manager: 'Carlos Mendes', startDate: '15/02/2026', budget: 'R$ 85.000', status: 'completed' },
  { id: '3', name: 'Água Limpa', manager: 'Mariana Costa', startDate: '05/03/2026', budget: 'R$ 210.000', status: 'blocked' },
  { id: '4', name: 'Cultura Inclusiva', manager: 'João Pedro', startDate: '22/04/2026', budget: 'R$ 90.000', status: 'active' },
];

export default function ProjectList() {
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Excluir Projeto',
      content: 'Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.',
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        console.log('Excluído', id);
      },
    });
  };

  const columns: ColumnsType<Project> = [
    {
      title: 'Nome do Projeto',
      dataIndex: 'name',
      key: 'name',
      className: 'font-semibold text-dark-900',
    },
    {
      title: 'Responsável',
      dataIndex: 'manager',
      key: 'manager',
      className: 'text-dark-500 font-medium',
    },
    {
      title: 'Data de Início',
      dataIndex: 'startDate',
      key: 'startDate',
      className: 'text-dark-500',
    },
    {
      title: 'Orçamento',
      dataIndex: 'budget',
      key: 'budget',
      className: 'text-dark-900 font-medium',
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        const statusConfig = {
          // Usando nossa escala do Tailwind!
          active: { text: 'Em Andamento', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
          completed: { text: 'Concluído', classes: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
          blocked: { text: 'Bloqueado', classes: 'bg-red-50 text-red-600 border-red-200' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag className={`px-3 py-1 rounded-full border font-medium ${config.classes}`}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/projects/${record.id}`)} className="text-dark-300 hover:text-secondary-500 transition-colors" />
          <Button type="text" icon={<Edit size={18} />} onClick={() => navigate(`/projects/${record.id}/edit`)} className="text-dark-300 hover:text-primary-500 transition-colors" />
          <Button type="text" icon={<Trash2 size={18} />} onClick={() => handleDelete(record.id)} className="text-dark-300 hover:text-red-500 transition-colors" />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Projetos</h1>
          <p className="text-dark-400 text-sm mt-1">Gestão de iniciativas e acompanhamento de impacto.</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          size="large"
          className="bg-primary-500 hover:!bg-primary-600 border-none shadow-soft flex items-center rounded-lg font-medium"
          onClick={() => navigate('/projects/new')}
        >
          Novo Projeto
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-surface p-4 rounded-xl shadow-soft border border-dark-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <Radio.Group defaultValue="all" buttonStyle="solid" className="flex">
          <Radio.Button value="all" className="before:hidden text-dark-900">Todos</Radio.Button>
          <Radio.Button value="active" className="before:hidden text-primary-600">Ativos</Radio.Button>
          <Radio.Button value="completed" className="before:hidden text-secondary-600">Concluídos</Radio.Button>
        </Radio.Group>
        
        <div className="flex w-full md:w-auto gap-3">
          <Input 
            placeholder="Buscar projetos..." 
            prefix={<Search size={16} className="text-dark-300" />} 
            className="rounded-lg w-full md:w-72 hover:border-secondary-400 focus:border-secondary-500"
          />
          <Button icon={<Filter size={18} />} className="flex items-center rounded-lg text-dark-600 hover:!text-secondary-500 hover:!border-secondary-400">
            Filtros
          </Button>
        </div>
      </div>

      {/* Tabela com Override do Tailwind usando a cor Dark-900 */}
      <div className="bg-surface rounded-xl shadow-soft border border-dark-100 overflow-hidden 
        [&_thead_th]:!bg-dark-900 [&_thead_th]:!text-white [&_thead_th]:!font-medium [&_thead_th]:!py-4 [&_thead_th]:!border-none">
        <Table 
          columns={columns} 
          dataSource={mockData} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="ant-table-premium"
        />
      </div>
    </div>
  );
}