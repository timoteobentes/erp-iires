import { Form, Input, Button, DatePicker, Select, Card, Row, Col } from 'antd';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const normalizeCurrency = (value: string | undefined) => {
  if (!value) return '';
  const onlyNumbers = String(value).replace(/\D/g, '');
  const numberValue = Number(onlyNumbers) / 100;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

export default function ReceivablesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/receivables')} className="rounded-xl border border-dark-100 h-10 w-10 flex items-center justify-center bg-white" />
        <h1 className="text-2xl font-bold text-dark-900">{id ? 'Editar Receita' : 'Nova Conta a Receber'}</h1>
      </div>

      <Form form={form} layout="vertical" onFinish={() => navigate('/finance/receivables')} requiredMark={false}>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label={<span className="font-bold text-dark-600">Descrição da Receita</span>} name="description" rules={[{ required: true }]}>
                <Input size="large" placeholder="Ex: Doação Campanha de Inverno" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Origem / Pagador</span>} name="payer">
                <Input size="large" prefix={<User size={16} className="text-dark-300" />} placeholder="Nome da empresa, órgão ou doador" className="rounded-xl" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Valor Estimado</span>} name="value" normalize={normalizeCurrency}>
                <Input size="large" placeholder="R$ 0,00" className="rounded-xl font-bold text-primary-600" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Previsão de Recebimento</span>} name="dueDate">
                <DatePicker size="large" className="w-full rounded-xl" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-bold text-dark-600">Categoria da Receita</span>} name="category">
                <Select size="large" className="rounded-xl [&_.ant-select-selector]:!rounded-xl" placeholder="Selecione a categoria">
                  <Select.Option value="donation">Doação Pessoa Física</Select.Option>
                  <Select.Option value="sponsorship">Patrocínio Corporativo</Select.Option>
                  <Select.Option value="grant">Edital / Subvenção</Select.Option>
                  <Select.Option value="event">Evento / Campanha</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button size="large" onClick={() => navigate('/finance/receivables')} className="rounded-xl">Cancelar</Button>
            <Button size="large" type="primary" htmlType="submit" className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold">Salvar Receita</Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}