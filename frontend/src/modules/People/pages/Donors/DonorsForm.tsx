import { useState } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, Divider, Radio } from 'antd';
import { ArrowLeft, User, MapPin, HeartHandshake, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCep } from '../../hooks/useCep';
import { useCnpj } from '../../hooks/useCnpj'; // Nosso novo Hook
import { normalizeCPF, normalizeCNPJ, normalizePhone, normalizeCEP, stripMask } from '../../../../utils/masks';

export default function DonorsForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  // Nossos hooks de automação (Padrão AmaDev)
  const { loadingCep, handleCEPBlur } = useCep(form);
  const { loadingCnpj, handleCNPJBlur } = useCnpj(form);
  
  // Controle para PF / PJ
  const [donorType, setDonorType] = useState<'PF' | 'PJ'>('PF');

  const onFinish = (values: any) => {
    const payload = { 
      ...values, 
      document: stripMask(values.document), 
      phone: stripMask(values.phone), 
      cep: stripMask(values.cep) 
    };
    console.log('Enviando Doador Limpo:', payload);
    navigate('/people/donors');
  };

  // Funções dinâmicas dependendo do tipo do doador
  const isPF = donorType === 'PF';
  const documentMask = isPF ? normalizeCPF : normalizeCNPJ;
  const documentMaxLength = isPF ? 14 : 18; // Limite exato da máscara (ex: 000.000.000-00 = 14)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/people/donors')} className="rounded-xl border border-dark-100 bg-white h-10 w-10 flex items-center justify-center" />
        <h1 className="text-2xl font-bold text-dark-900">{id ? 'Editar Doador' : 'Novo Doador'}</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} initialValues={{ type: 'PF' }}>
        
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-dark-900">
              <User size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Informações Básicas</h2>
            </div>
            <Form.Item name="type" className="mb-0">
              <Radio.Group 
                onChange={(e) => {
                  setDonorType(e.target.value);
                  form.setFieldValue('document', ''); // Limpa o documento ao trocar o tipo
                }} 
                buttonStyle="solid"
              >
                <Radio.Button value="PF" className="rounded-l-lg font-medium px-6">Pessoa Física</Radio.Button>
                <Radio.Button value="PJ" className="rounded-r-lg font-medium px-6">Pessoa Jurídica</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item label={<span className="font-bold text-dark-600">{isPF ? 'Nome Completo' : 'Razão Social'}</span>} name="name" rules={[{ required: true }]}>
                <Input size="large" className="rounded-xl" placeholder={isPF ? 'Nome do doador' : 'Nome da empresa'} />
              </Form.Item>
            </Col>
            
            {/* Campo de Documento com Máscara, Limite e Busca CNPJ */}
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span className="font-bold text-dark-600">{isPF ? 'CPF' : 'CNPJ'}</span>} 
                name="document" 
                normalize={documentMask}
              >
                <Input 
                  size="large" 
                  maxLength={documentMaxLength} // Limita fisicamente a digitação
                  className="rounded-xl" 
                  placeholder={isPF ? '000.000.000-00' : '00.000.000/0000-00'} 
                  onBlur={!isPF ? handleCNPJBlur : undefined} // Busca automática só se for PJ
                  suffix={loadingCnpj && <Loader2 size={16} className="animate-spin text-secondary-500" />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Celular / Telefone Comercial</span>} name="phone" normalize={normalizePhone}>
                <Input size="large" className="rounded-xl" placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">E-mail de Contato</span>} name="email" rules={[{ type: 'email' }]}>
                <Input size="large" className="rounded-xl" placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="my-8" />

          {/* Endereço utilizando o Hook */}
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <MapPin size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold">Endereço de Faturamento</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item label={<span className="font-bold text-dark-600">CEP</span>} name="cep" normalize={normalizeCEP}>
                <Input 
                  size="large" 
                  maxLength={9} 
                  className="rounded-xl" 
                  onBlur={handleCEPBlur} 
                  suffix={loadingCep && <Loader2 size={16} className="animate-spin text-primary-500" />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}><Form.Item label={<span className="font-bold text-dark-600">Logradouro</span>} name="address"><Input size="large" className="rounded-xl" /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label={<span className="font-bold text-dark-600">Número</span>} name="number" id="team_form_number"><Input size="large" className="rounded-xl" /></Form.Item></Col>
            <Col xs={24} md={10}><Form.Item label={<span className="font-bold text-dark-600">Bairro</span>} name="neighborhood"><Input size="large" className="rounded-xl" /></Form.Item></Col>
            <Col xs={24} md={10}><Form.Item label={<span className="font-bold text-dark-600">Cidade</span>} name="city"><Input size="large" className="rounded-xl" /></Form.Item></Col>
            <Col xs={24} md={4}><Form.Item label={<span className="font-bold text-dark-600">UF</span>} name="state"><Input size="large" className="rounded-xl" /></Form.Item></Col>
          </Row>
        </Card>

        {/* Preferências de Doação */}
        <Card className="rounded-2xl shadow-soft border-dark-100 mt-6" bodyStyle={{ padding: '32px' }}>
          <div className="flex items-center gap-2 mb-6 text-dark-900">
            <HeartHandshake size={20} className="text-warning" />
            <h2 className="text-lg font-bold">Perfil de Doação</h2>
          </div>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Recorrência Principal</span>} name="recurrence">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Ex: Mensal">
                  <Select.Option value="Mensal">Mensal</Select.Option>
                  <Select.Option value="Trimestral">Trimestral</Select.Option>
                  <Select.Option value="Anual">Anual</Select.Option>
                  <Select.Option value="Unica">Doação Única</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Método de Pagamento Preferido</span>} name="paymentMethod">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Ex: PIX, Cartão...">
                  <Select.Option value="PIX">PIX</Select.Option>
                  <Select.Option value="Cartao">Cartão de Crédito</Select.Option>
                  <Select.Option value="Boleto">Boleto Bancário</Select.Option>
                  <Select.Option value="Transferencia">Transferência TED/DOC</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => navigate('/people/donors')} className="rounded-xl">Cancelar</Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft">
              Salvar Doador
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}