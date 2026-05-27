import { useState, useEffect } from 'react';
import { Card, Button, Tag, Row, Col, Divider, Skeleton, notification } from 'antd';
import { ArrowLeft, Edit, Calendar, User, Tag as TagIcon, Briefcase, Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionsService, type Transaction } from '../../services/transactions.service';

// ============================================================
// HELPERS
// ============================================================
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusConfig: Record<string, { text: string; classes: string }> = {
  PAID: { text: 'Pago', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  PENDING: { text: 'Pendente de Pagamento', classes: 'bg-yellow-50 text-warning border-yellow-200' },
  CANCELED: { text: 'Cancelado', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
};

export default function PayablesView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await transactionsService.getById(id);
        setTransaction(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Transação não encontrada.' });
        navigate('/finance/payables');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton.Button active size="large" />
          <Skeleton.Input active style={{ width: 220 }} />
        </div>
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (!transaction) return null;

  const cfg = statusConfig[transaction.status] ?? { text: transaction.status, classes: 'bg-dark-50 text-dark-400 border-dark-200' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/finance/payables')}
            className="rounded-xl border border-dark-100 bg-white"
          />
          <h1 className="text-2xl font-bold text-dark-900">Detalhes da Conta</h1>
        </div>
        <Button
          type="primary"
          icon={<Edit size={18} />}
          onClick={() => navigate(`/finance/payables/${id}/edit`)}
          className="bg-dark-900 border-none rounded-xl"
        >
          Editar
        </Button>
      </div>

      <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <Tag className={`font-bold px-3 py-1 rounded-full uppercase text-xs mb-3 border ${cfg.classes}`}>
              {cfg.text}
            </Tag>
            <h2 className="text-3xl font-bold text-dark-900 tracking-tight">{transaction.title}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-dark-400">Valor Total</p>
            <p className="text-3xl font-bold text-dark-900">{fmt(transaction.amount)}</p>
          </div>
        </div>

        <Divider />

        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12}>
            <div className="flex gap-3">
              <User className="text-dark-300 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Fornecedor / Favorecido</p>
                <p className="text-base font-medium text-dark-900">{transaction.description || '—'}</p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="flex gap-3">
              <Calendar className="text-dark-300 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Data</p>
                <p className="text-base font-medium text-dark-900">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="flex gap-3">
              <TagIcon className="text-dark-300 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Categoria</p>
                <p className="text-base font-medium text-dark-900">{transaction.category ?? '—'}</p>
              </div>
            </div>
          </Col>
          {transaction.project && (
            <Col xs={24} sm={12}>
              <div className="flex gap-3">
                <Briefcase className="text-dark-300 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Projeto</p>
                  <p className="text-base font-medium text-dark-900">{transaction.project.name}</p>
                </div>
              </div>
            </Col>
          )}
          {transaction.partner && (
            <Col xs={24} sm={12}>
              <div className="flex gap-3">
                <Building2 className="text-dark-300 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Parceiro</p>
                  <p className="text-base font-medium text-dark-900">{transaction.partner.name}</p>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
}
