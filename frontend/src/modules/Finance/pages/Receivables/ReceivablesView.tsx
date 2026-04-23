import { Card, Button, Tag, Row, Col, Divider } from 'antd';
import { ArrowLeft, Edit, Calendar, User, Tag as TagIcon, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ReceivablesView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const data = {
    description: 'Edital de Inovação Social',
    payer: 'Prefeitura Municipal',
    dueDate: '15/05/2026',
    value: 45000,
    status: 'pending',
    category: 'Edital / Governo',
    observations: 'Referente à parcela 1/3 do edital aprovado no ano passado. Aguardando liberação do repasse.'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeft size={20} />} onClick={() => navigate('/finance/receivables')} className="rounded-xl border border-dark-100 bg-white" />
          <h1 className="text-2xl font-bold text-dark-900">Detalhes da Receita</h1>
        </div>
        <Button type="primary" icon={<Edit size={18} onClick={() => navigate(`/finance/receivables/${id}/edit`)} />} className="bg-dark-900 border-none rounded-xl">Editar</Button>
      </div>

      <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <Tag className="bg-yellow-50 text-warning border-yellow-200 font-bold px-3 py-1 rounded-full uppercase text-xs mb-3">Aguardando Recebimento</Tag>
            <h2 className="text-3xl font-bold text-dark-900 tracking-tight">{data.description}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dark-400">Valor Estimado</p>
            <p className="text-3xl font-bold text-primary-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}</p>
          </div>
        </div>

        <Divider />

        <Row gutter={[32, 32]}>
          <Col span={12}>
            <div className="flex gap-3">
              <User className="text-dark-300" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Origem / Pagador</p>
                <p className="text-base font-medium text-dark-900">{data.payer}</p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex gap-3">
              <Calendar className="text-dark-300" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Previsão</p>
                <p className="text-base font-medium text-dark-900">{data.dueDate}</p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex gap-3">
              <TagIcon className="text-dark-300" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Categoria</p>
                <p className="text-base font-medium text-dark-900">{data.category}</p>
              </div>
            </div>
          </Col>
          <Col span={24}>
            <div className="flex gap-3">
              <FileText className="text-dark-300" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Observações</p>
                <p className="text-sm text-dark-600 italic mt-1">{data.observations}</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}