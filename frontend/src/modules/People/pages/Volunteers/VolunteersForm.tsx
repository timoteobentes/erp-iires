import { Form, Input, Button, Select, Card, Row, Col, Divider, DatePicker, Checkbox } from 'antd';
import { ArrowLeft, User, MapPin, Star, PhoneCall, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { normalizeCPF, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';

export default function VolunteersForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { handleCEPBlur } = useCep(form);

  const onFinish = (values: any) => {
    // Limpando todas as máscaras antes de enviar pro backend
    const payload = { 
      ...values, 
      cpf: stripMask(values.cpf), 
      phone: stripMask(values.phone), 
      emergencyPhone: stripMask(values.emergencyPhone),
      cep: stripMask(values.cep) 
    };
    console.log('Enviando Voluntário Limpo pro Backend:', payload);
    navigate('/people/volunteers');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button 
          type="text" 
          icon={<ArrowLeft size={20} />} 
          onClick={() => navigate('/people/volunteers')} 
          className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" 
        />
        <h1 className="text-2xl font-bold text-dark-900">{id ? 'Editar Voluntário' : 'Novo Voluntário'}</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        
        {/* Seção 1: Dados Pessoais & Profissionais */}
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <User size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Informações Pessoais</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label={<span className="font-bold text-dark-600">Nome Completo</span>} name="name" rules={[{ required: true }]}>
                <Input size="large" className="rounded-xl" placeholder="Nome completo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">Data de Nascimento</span>} name="birthDate">
                <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" placeholder="DD/MM/AAAA" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">CPF</span>} name="cpf" normalize={normalizeCPF}>
                <Input size="large" className="rounded-xl" placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">Celular / WhatsApp</span>} name="phone" normalize={normalizePhone}>
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">E-mail</span>} name="email">
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={<span className="font-bold text-dark-600">Profissão / Ocupação Atual</span>} name="profession">
                <Input size="large" className="rounded-xl" placeholder="Ex: Estudante, Engenheiro, Designer..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Seção 2: Endereço (Utilizando nosso Hook inteligente) */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold">Endereço</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item label={<span className="font-bold text-dark-600">CEP</span>} name="cep" normalize={normalizeCEP}>
                <Input size="large" className="rounded-xl" placeholder="00000-000" onBlur={handleCEPBlur} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Logradouro</span>} name="address">
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label={<span className="font-bold text-dark-600">Número</span>} name="number" id="team_form_number">
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
                <Input size="large" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Seção 3: Perfil, Habilidades e Emergência */}
        <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <Star size={20} className="text-warning" />
            <h2 className="text-lg font-bold">Engajamento & Habilidades</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label={<span className="font-bold text-dark-600">Áreas de Interesse / Habilidades</span>} name="skills">
                <Select mode="multiple" size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione as áreas onde deseja atuar">
                  <Select.Option value="Educação">Educação e Mentoria</Select.Option>
                  <Select.Option value="Artes">Artes e Cultura</Select.Option>
                  <Select.Option value="Saúde">Saúde e Bem-estar</Select.Option>
                  <Select.Option value="TI">Tecnologia (TI)</Select.Option>
                  <Select.Option value="Eventos">Logística de Eventos</Select.Option>
                  <Select.Option value="Comunicação">Marketing e Comunicação</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={<span className="font-bold text-dark-600">Disponibilidade de Turno</span>} name="availability">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Melhor turno">
                  <Select.Option value="Manhã">Manhã</Select.Option>
                  <Select.Option value="Tarde">Tarde</Select.Option>
                  <Select.Option value="Noite">Noite</Select.Option>
                  <Select.Option value="Flexível">Horário Flexível</Select.Option>
                  <Select.Option value="Final de Semana">Apenas Finais de Semana</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* NOVO: Contato de Emergência */}
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
              <Form.Item label={<span className="font-bold text-dark-600">Telefone de Emergência</span>} name="emergencyPhone" normalize={normalizePhone}>
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* NOVO: Área Jurídica / Termos */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <ShieldCheck size={20} className="text-primary-600" />
            <h2 className="text-lg font-bold">Documentação Legal</h2>
          </div>
          <Row>
            <Col span={24}>
              <Form.Item name="acceptedTerms" valuePropName="checked" rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('O aceite do termo é obrigatório')) }]}>
                <Checkbox className="text-dark-600 font-medium">
                  Declaro ter lido e aceito o <a href="#" className="text-secondary-600 hover:text-secondary-700 underline">Termo de Adesão ao Trabalho Voluntário</a> e autorizo o uso da minha imagem para fins institucionais.
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-dark-100">
            <Button size="large" onClick={() => navigate('/people/volunteers')} className="rounded-xl px-8">Cancelar</Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-primary-500 hover:!bg-primary-600 rounded-xl font-bold shadow-soft px-8">
              {id ? 'Atualizar Ficha' : 'Salvar Voluntário'}
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}