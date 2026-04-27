import { Form, Input, Button, Select, Card, Row, Col, Divider } from 'antd';
import { ArrowLeft, User, MapPin, Shield, Phone, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';

export default function TeamForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  const { loadingCep, handleCEPBlur } = useCep(form);

  // PREPARANDO PARA O BACKEND: Limpando as máscaras!
  const onFinish = (values: any) => {
    const payload = {
      ...values,
      cpf: stripMask(values.cpf),
      phone: stripMask(values.phone),
      cep: stripMask(values.cep),
    };
    
    console.log('Payload limpo para o Prisma/Node:', payload);
    navigate('/people/team');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button 
          type="text" 
          icon={<ArrowLeft size={20} />} 
          onClick={() => navigate('/people/team')} 
          className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" 
        />
        <h1 className="text-2xl font-bold text-dark-900">{id ? 'Editar Colaborador' : 'Cadastrar Funcionário'}</h1>
      </div>

      <Form form={form} name="team_form" layout="vertical" onFinish={onFinish} requiredMark={false}>
        
        {/* Seção 1: Dados Pessoais */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <User size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Informações Pessoais & Contato</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label={<span className="font-bold text-dark-600">Nome Completo</span>} name="name" rules={[{ required: true }]}>
                <Input size="large" className="rounded-xl" placeholder="Nome do colaborador" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span className="font-bold text-dark-600">CPF</span>} 
                name="cpf"
                normalize={normalizeCPF} // Aplica a máscara em tempo real
              >
                <Input size="large" className="rounded-xl" placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">E-mail Pessoal</span>} name="personal_email">
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span className="font-bold text-dark-600">Celular / WhatsApp</span>} 
                name="phone"
                normalize={normalizePhone} // Aplica a máscara em tempo real
              >
                <Input size="large" prefix={<Phone size={16} className="text-dark-300" />} className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Seção 2: Endereço (Consumindo o Hook e a Máscara) */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Endereço Residencial</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item 
                label={<span className="font-bold text-dark-600">CEP</span>} 
                name="cep"
                normalize={normalizeCEP} // Máscara visual do CEP
              >
                <Input 
                  size="large" 
                  className="rounded-xl" 
                  placeholder="00000-000" 
                  onBlur={handleCEPBlur} // Ligação com a busca do ViaCEP
                  suffix={loadingCep && <Loader2 size={16} className="animate-spin text-primary-500" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item label={<span className="font-bold text-dark-600">Logradouro</span>} name="address"><Input size="large" className="rounded-xl" placeholder="Rua, Avenida..." /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label={<span className="font-bold text-dark-600">Número</span>} name="number" id="team_form_number"><Input size="large" className="rounded-xl" placeholder="123" /></Form.Item></Col>
            <Col xs={24} md={10}><Form.Item label={<span className="font-bold text-dark-600">Bairro</span>} name="neighborhood"><Input size="large" className="rounded-xl" placeholder="Bairro" /></Form.Item></Col>
            <Col xs={24} md={10}><Form.Item label={<span className="font-bold text-dark-600">Cidade</span>} name="city"><Input size="large" className="rounded-xl" placeholder="Cidade" /></Form.Item></Col>
            <Col xs={24} md={4}><Form.Item label={<span className="font-bold text-dark-600">UF</span>} name="state"><Input size="large" className="rounded-xl" placeholder="UF" /></Form.Item></Col>
          </Row>
        </Card>

        {/* Seção 3: Cargo e Acesso (Restante do Form mantido idêntico) */}
        <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Shield size={20} className="text-warning" />
            <h2 className="text-lg font-bold">Cargo & Acesso ao Sistema</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={12}><Form.Item label={<span className="font-bold text-dark-600">Cargo</span>} name="role" rules={[{ required: true }]}><Input size="large" className="rounded-xl" placeholder="Ex: Analista de TI" /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Nível Hierárquico</span>} name="level">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione o nível">
                  <Select.Option value="diretor">Diretor</Select.Option>
                  <Select.Option value="lider">Líder / Coordenador</Select.Option>
                  <Select.Option value="operacional">Operacional / Funcionário</Select.Option>
                  <Select.Option value="voluntario">Voluntário</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24}><Divider className="my-4" /></Col>

            <Col xs={24} md={12}><Form.Item label={<span className="font-bold text-dark-600">E-mail de Login (Corporativo)</span>} name="email" rules={[{ required: true }]}><Input size="large" className="rounded-xl" placeholder="login@iires.org" /></Form.Item></Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Grupo de Acesso (Permissões)</span>} name="group">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione o grupo">
                  <Select.Option value="admin">Administrador (Total)</Select.Option>
                  <Select.Option value="comercial">Comercial / CRM</Select.Option>
                  <Select.Option value="financeiro">Financeiro</Select.Option>
                  <Select.Option value="tecnologia">Tecnologia / Inovação</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => navigate('/people/team')} className="rounded-xl px-8">Cancelar</Button>
            <Button 
              size="large" 
              type="primary" 
              htmlType="submit" 
              className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft px-8 flex items-center"
            >
              {id ? 'Atualizar Dados' : 'Finalizar Cadastro'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}