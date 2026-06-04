import { useState } from 'react';
import { Card, Row, Col, Button, Input, Form, Select, message } from 'antd';
import { Building2, ShieldCheck } from 'lucide-react';
import { SESSION_TIMEOUT_KEY } from '../../../hooks/useInactivityTimer';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();

  const initialValues = {
    ongName: 'Instituto de Inovação e Resgate Social (IIRes)',
    ongCnpj: '27.865.757/0001-02',
    ongEmail: 'contato@iires.org',
    ongWebsite: 'www.iires.org',
    sessionTimeout: localStorage.getItem(SESSION_TIMEOUT_KEY) || '30',
  };

  const handleSave = (values: any) => {
    if (values.sessionTimeout) {
      localStorage.setItem(SESSION_TIMEOUT_KEY, values.sessionTimeout);
    }
    message.success('Configurações salvas com sucesso!');
  };

  const menuItems = [
    {
      key: 'general',
      icon: <Building2 size={20} />,
      label: 'Dados da Instituição',
      desc: 'Informações globais do Instituto',
    },
    {
      key: 'security',
      icon: <ShieldCheck size={20} />,
      label: 'Segurança & Acessos',
      desc: 'Regras de sessão e autenticação',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Configurações do Sistema</h1>
          <p className="text-dark-400 text-sm mt-0.5">Gerencie os parâmetros globais e segurança do ERP.</p>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">

        {/* MENU LATERAL */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ padding: '16px' }}>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-4 px-2">Painel de Controle</p>
            <div className="space-y-2">
              {menuItems.map((item) => (
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

        {/* FORMULÁRIO */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: 0 }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={handleSave}
              requiredMark={false}
            >

              {/* ABA: DADOS DA INSTITUIÇÃO */}
              <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Dados da Instituição</h2>
                  <p className="text-sm text-dark-500 mt-1">
                    Essas informações aparecerão no cabeçalho dos relatórios e recibos de doação.
                  </p>
                </div>
                <div className="p-6">
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Razão Social / Nome da ONG</span>}
                        name="ongName"
                      >
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">CNPJ Principal</span>}
                        name="ongCnpj"
                      >
                        <Input size="large" className="rounded-xl" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">E-mail de Contato Geral</span>}
                        name="ongEmail"
                      >
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label={<span className="font-bold text-dark-600">Website Institucional</span>}
                        name="ongWebsite"
                      >
                        <Input size="large" className="rounded-xl" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* ABA: SEGURANÇA & ACESSOS */}
              <div className={activeTab === 'security' ? 'block' : 'hidden'}>
                <div className="p-6 border-b border-dark-100">
                  <h2 className="text-xl font-bold text-dark-900">Segurança & Acessos</h2>
                  <p className="text-sm text-dark-500 mt-1">
                    Defina as políticas de acesso e sessão para a equipe interna.
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span className="font-bold text-dark-600">
                            Tempo de inatividade da Sessão
                          </span>
                        }
                        name="sessionTimeout"
                        extra="O usuário será desconectado automaticamente após esse período sem interação."
                      >
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

              {/* RODAPÉ */}
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
