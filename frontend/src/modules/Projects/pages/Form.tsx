import React from 'react';
import { Form, Input, Button, DatePicker, Select, Row, Col } from 'antd';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const onFinish = (values: any) => {
    console.log('Form values:', values);
    navigate('/projects');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          type="text" 
          icon={<ArrowLeft size={20} />} 
          onClick={() => navigate('/projects')}
          className="text-gray-500 hover:text-dark"
        />
        <h1 className="text-2xl font-bold text-dark">
          {isEditing ? 'Editar Projeto' : 'Criar Novo Projeto'}
        </h1>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-soft border border-gray-100">
        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Nome do Projeto" name="name" rules={[{ required: true, message: 'Campo obrigatório' }]}>
                <Input size="large" placeholder="Ex: Educação Sustentável" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Responsável" name="manager" rules={[{ required: true }]}>
                <Input size="large" placeholder="Nome do gerente" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Status Inicial" name="status" initialValue="active">
                <Select size="large" className="rounded-lg">
                  <Select.Option value="active">Em Andamento</Select.Option>
                  <Select.Option value="blocked">Bloqueado</Select.Option>
                  <Select.Option value="completed">Concluído</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Data de Início" name="startDate">
                <DatePicker size="large" className="w-full rounded-lg" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Orçamento Previsto (R$)" name="budget">
                <Input size="large" type="number" placeholder="0.00" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Descrição / Objetivos" name="description">
                <Input.TextArea rows={4} className="rounded-lg" placeholder="Descreva os objetivos deste projeto..." />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-4 mt-6">
            <Button size="large" onClick={() => navigate('/projects')} className="rounded-lg">
              Cancelar
            </Button>
            <Button size="large" type="primary" htmlType="submit" icon={<Save size={18} />} className="bg-primary hover:bg-primary/90 rounded-lg flex items-center">
              Salvar Projeto
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}