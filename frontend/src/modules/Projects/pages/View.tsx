import React from 'react';
import { Button, Descriptions, Tag } from 'antd';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeft size={20} />} 
            onClick={() => navigate('/projects')}
            className="text-gray-500 hover:text-dark"
          />
          <h1 className="text-2xl font-bold text-dark">Detalhes do Projeto</h1>
        </div>
        <Button 
          type="primary" 
          icon={<Edit size={18} />} 
          onClick={() => navigate(`/projects/${id}/edit`)}
          className="bg-secondary hover:bg-secondary/90 rounded-lg flex items-center"
        >
          Editar Projeto
        </Button>
      </div>

      <div className="bg-surface p-8 rounded-xl shadow-soft border border-gray-100">
        <Descriptions title="Informações Gerais" bordered column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Nome">Inovação Verde</Descriptions.Item>
          <Descriptions.Item label="Responsável">Ana Silva</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="green" className="rounded-full px-3">Em Andamento</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Data de Início">10/01/2026</Descriptions.Item>
          <Descriptions.Item label="Orçamento">R$ 150.000,00</Descriptions.Item>
          <Descriptions.Item label="Progresso">45% Concluído</Descriptions.Item>
          <Descriptions.Item label="Descrição" span={3}>
            Projeto voltado para o desenvolvimento de hortas comunitárias sustentáveis com foco na capacitação de jovens em situação de vulnerabilidade.
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
}