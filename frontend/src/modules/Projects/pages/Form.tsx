import { useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Row, Col, Card } from 'antd';
import { ArrowLeft, Briefcase, Users, AlignLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Função utilitária para aplicar a máscara de moeda (Padrão AmaDev)
const normalizeCurrency = (value: string | undefined) => {
  if (!value) return '';
  
  // Remove tudo que não for número
  const onlyNumbers = String(value).replace(/\D/g, '');
  if (!onlyNumbers) return '';
  
  // Divide por 100 para criar os centavos automaticamente
  const numberValue = Number(onlyNumbers) / 100;
  
  // Formata usando a API nativa do navegador para BRL
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditing) {
      form.setFieldsValue({
        name: 'Inovação Verde',
        manager: 'Ana Silva',
        status: 'active',
        // O valor do mock também já precisa vir com a formatação ou ser passado pelo normalizer
        budget: 'R$ 150.000,00', 
        team: ['ana', 'beto', 'carla'],
        description: 'Projeto voltado para o desenvolvimento de hortas comunitárias sustentáveis...'
      });
    }
  }, [isEditing, form]);

  const onFinish = (values: any) => {
    // Para enviar pro backend, você limpa a formatação e converte de volta para número
    const rawBudget = Number(values.budget.replace(/\D/g, '')) / 100;
    
    const payload = {
      ...values,
      budget: rawBudget
    };
    
    console.log('Payload limpo pronto para o Prisma:', payload);
    navigate('/projects');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header da Página */}
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
                <Input size="large" placeholder="Ex: Educação Sustentável" className="rounded-xl hover:border-secondary-400 focus:border-secondary-500" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span className="text-dark-600 font-medium">Status Inicial</span>} 
                name="status" 
                initialValue="draft"
              >
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl">
                  <Select.Option value="active">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-500"></div> Em Andamento</div>
                  </Select.Option>
                  <Select.Option value="draft">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-dark-300"></div> Rascunho</div>
                  </Select.Option>
                  <Select.Option value="completed">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-secondary-500"></div> Concluído</div>
                  </Select.Option>
                  <Select.Option value="blocked">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Bloqueado</div>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item 
                label={<span className="text-dark-600 font-medium">Data de Início (Previsão)</span>} 
                name="startDate"
              >
                <DatePicker size="large" className="w-full rounded-xl hover:border-secondary-400 focus:border-secondary-500" format="DD/MM/YYYY" placeholder="Selecione a data" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 2: Equipe e Orçamento */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-dark-900">
              <Users size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Equipe e Recursos</h2>
            </div>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span className="text-dark-600 font-medium">Responsável (Líder)</span>} 
                name="manager" 
                rules={[{ required: true, message: 'Selecione um responsável' }]}
              >
                <Select size="large" placeholder="Selecione o líder do projeto" className="rounded-xl [&_.ant-select-selector]:!rounded-xl">
                  <Select.Option value="Ana Silva">Ana Silva</Select.Option>
                  <Select.Option value="Carlos Mendes">Carlos Mendes</Select.Option>
                  <Select.Option value="Mariana Costa">Mariana Costa</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span className="text-dark-600 font-medium">Orçamento Previsto</span>} 
                name="budget"
                normalize={normalizeCurrency} // Aplica a máscara em tempo real
              >
                <Input 
                  size="large" 
                  placeholder="R$ 0,00" 
                  className="rounded-xl font-medium text-dark-900 hover:border-secondary-400 focus:border-secondary-500" 
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item 
                label={<span className="text-dark-600 font-medium">Membros da Equipe</span>} 
                name="team"
              >
                <Select 
                  mode="multiple" 
                  size="large" 
                  placeholder="Adicione membros ao projeto" 
                  className="rounded-xl [&_.ant-select-selector]:!rounded-xl"
                  options={[
                    { value: 'ana', label: 'Ana Silva' },
                    { value: 'beto', label: 'Beto Gomes' },
                    { value: 'carla', label: 'Carla Dias' },
                    { value: 'diana', label: 'Diana Prince' },
                    { value: 'joao', label: 'João Pedro' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* BLOCO 3: Detalhamento */}
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

        {/* Barra de Ações (Footer) */}
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
            className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft flex items-center"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
          </Button>
        </div>
      </Form>
    </div>
  );
}