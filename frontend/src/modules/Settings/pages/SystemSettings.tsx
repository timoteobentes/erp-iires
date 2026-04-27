import { useState } from 'react';
import { Card, Row, Col, Button, Input, Form, Divider, Switch, Select, message, Tag } from 'antd';
import { 
  Building2, 
  ShieldCheck, 
  Webhook, 
  Mail, 
  CreditCard,
  Key
} from 'lucide-react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();

  // Simulação de dados iniciais do sistema
  const initialValues = {
    ongName: 'Instituto de Inovação e Resgate Social (IIRes)',
    ongCnpj: '27.865.757/0001-02',
    ongEmail: 'contato@iires.org',
    ongWebsite: 'www.iires.org',
    force2FA: true,
    sessionTimeout: '30',
    smtpHost: 'smtp.sendgrid.net',
    paymentGateway: 'stripe',
  };

  const handleSave = (values: any) => {
    const hide = message.loading('Salvando configurações do sistema...', 0);
    setTimeout(() => {
      hide();
      message.success('Configurações atualizadas com sucesso! As mudanças já estão em vigor.');
      console.log('Novas configurações:', values);
    }, 1500);
  };

  const menuItems = [
    { key: 'general', icon: <Building2 size={20} />, label: 'Dados da Instituição', desc: 'Informações globais do Instituto' },
    { key: 'security', icon: <ShieldCheck size={20} />, label: 'Segurança & Acessos', desc: 'Regras de sessão e autenticação' },
    { key: 'integrations', icon: <Webhook size={20} />, label: 'APIs & Integrações', desc: 'Gateways de pagamento e e-mail' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Premium */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* <div className="h-12 w-12 bg-dark-900 rounded-2xl flex items-center justify-center text-white shadow-soft">
          <Settings size={24} />
        </div> */}
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Configurações do Sistema</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gerencie os parâmetros globais, integrações e segurança do ERP.</p>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        
        {/* MENU LATERAL DE CONFIGURAÇÕES */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '16px' }}>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-4 px-2">Painel de Controle</p>
            <div className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.key 
                      ? 'bg-primary-50 border border-primary-200 shadow-sm' 
                      : 'hover:bg-dark-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`${activeTab === item.key ? 'text-primary-600' : 'text-dark-400'}`}>
                      {item.icon}
                    </div>
                    <span className={`font-bold ${activeTab === item.key ? 'text-primary-700' : 'text-dark-600'}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className={`text-xs ml-8 ${activeTab === item.key ? 'text-primary-600/80' : 'text-dark-400'}`}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </Col>

        {/* ÁREA DO FORMULÁRIO */}
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: 0 }}>
            <Form 
              form={form} 
              layout="vertical" 
              initialValues={initialValues} 
              onFinish={handleSave}
              requiredMark={false}
            >
              
              {/* ABA: DADOS DA INSTITUIÇÃO */}
              <div className={`${activeTab === 'general' ? 'block' : 'hidden'}`}>
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Dados da Instituição</h2>
                  <p className="text-sm text-dark-500 mt-1">Essas informações aparecerão no cabeçalho dos relatórios e recibos de doação.</p>
                </div>
                <div className="p-6">
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label={<span className="font-bold text-dark-600">Razão Social / Nome da ONG</span>} name="ongName">
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">CNPJ Principal</span>} name="ongCnpj">
                        <Input size="large" className="rounded-xl" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">E-mail de Contato Geral</span>} name="ongEmail">
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label={<span className="font-bold text-dark-600">Website Institucional</span>} name="ongWebsite">
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* ABA: SEGURANÇA & ACESSOS */}
              <div className={`${activeTab === 'security' ? 'block' : 'hidden'}`}>
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Segurança & Acessos</h2>
                  <p className="text-sm text-dark-500 mt-1">Defina as políticas rigorosas de acesso para a equipe interna.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl border border-dark-100">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={20} className="text-green-600 mt-1" />
                      <div>
                        <p className="font-bold text-dark-900">Forçar Autenticação em 2 Fatores (2FA)</p>
                        <p className="text-xs text-dark-500 mt-0.5">Todos os usuários serão obrigados a usar o Google Authenticator no login.</p>
                      </div>
                    </div>
                    <Form.Item name="force2FA" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>

                  <Divider className="my-0" />

                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Tempo de inatividade da Sessão</span>} name="sessionTimeout">
                        <Select size="large" className="rounded-xl">
                          <Select.Option value="15">15 Minutos</Select.Option>
                          <Select.Option value="30">30 Minutos</Select.Option>
                          <Select.Option value="60">1 Hora</Select.Option>
                          <Select.Option value="120">2 Horas</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* ABA: INTEGRAÇÕES */}
              <div className={`${activeTab === 'integrations' ? 'block' : 'hidden'}`}>
                <div className="p-6 border-b border-dark-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-dark-900">APIs & Integrações</h2>
                    <p className="text-sm text-dark-500 mt-1">Conecte o ERP aos serviços externos.</p>
                  </div>
                  <Tag color="warning" className="rounded-full font-bold px-3 py-1 uppercase text-[10px] m-0">Requer TI</Tag>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-primary-500"/> Gateway de Pagamento (Doações)</h3>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Provedor</span>} name="paymentGateway">
                        <Select size="large" className="rounded-xl">
                          <Select.Option value="stripe">Stripe</Select.Option>
                          <Select.Option value="pagarme">Pagar.me</Select.Option>
                          <Select.Option value="mercado_pago">Mercado Pago</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label={<span className="font-bold text-dark-600">API Key (Produção)</span>}>
                        <Input.Password size="large" className="rounded-xl" placeholder="sk_live_..." prefix={<Key size={16} className="text-dark-300" />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-6" />

                  <h3 className="font-bold text-dark-900 mb-4 flex items-center gap-2"><Mail size={18} className="text-secondary-500"/> Servidor de E-mail (SMTP)</h3>
                  <Row gutter={24}>
                    <Col xs={24} md={16}>
                      <Form.Item label={<span className="font-bold text-dark-600">Host SMTP</span>} name="smtpHost">
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<span className="font-bold text-dark-600">Porta</span>}>
                        <Input size="large" className="rounded-xl" defaultValue="587" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Usuário SMTP</span>}>
                        <Input size="large" className="rounded-xl" placeholder="apikey" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label={<span className="font-bold text-dark-600">Senha SMTP</span>}>
                        <Input.Password size="large" className="rounded-xl" placeholder="••••••••••••" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* RODAPÉ DO FORMULÁRIO (Fixo para todas as abas) */}
              <div className="p-6 bg-dark-50/50 border-t border-dark-100 flex justify-end">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-8"
                >
                  Salvar Configurações
                </Button>
              </div>

            </Form>
          </Card>
        </Col>

      </Row>
    </div>
  );
}