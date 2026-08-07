import { useState, useEffect } from 'react';
import { Card, Button, Tag, Row, Col, Divider, Skeleton, notification } from 'antd';
import { ArrowLeft, Edit, Calendar, User, Tag as TagIcon, Briefcase, Paperclip } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionsService, type Transaction } from '../../services/transactions.service';
import { attachmentsService, type AttachmentDTO } from '../../services/attachments.service';

// ============================================================
// HELPERS
// ============================================================
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusConfig: Record<string, { text: string; classes: string }> = {
  PAID: { text: 'Recebido', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  PENDING: { text: 'Aguardando Recebimento', classes: 'bg-yellow-50 text-warning border-yellow-200' },
  CANCELED: { text: 'Cancelado', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
};

export default function ReceivablesView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const data = await transactionsService.getById(id);
        setTransaction(data);
        attachmentsService.list({ transactionId: id }).then(setAttachments).catch(() => {});
      } catch {
        notification.error({ message: 'Erro', description: 'Transação não encontrada.' });
        navigate('/finance/receivables');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const openAttachment = async (attachmentId: string) => {
    try {
      const { url } = await attachmentsService.getDownloadUrl(attachmentId);
      window.open(url, '_blank', 'noopener');
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível abrir o anexo.' });
    }
  };

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
            onClick={() => navigate('/finance/receivables')}
            className="rounded-xl border border-dark-100 bg-white"
          />
          <h1 className="text-2xl font-bold text-dark-900">Detalhes da Receita</h1>
        </div>
        <Button
          type="primary"
          icon={<Edit size={18} />}
          onClick={() => navigate(`/finance/receivables/${id}/edit`)}
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
            <p className="text-sm font-medium text-dark-400">Valor</p>
            <p className="text-3xl font-bold text-primary-600">{fmt(transaction.amount)}</p>
          </div>
        </div>

        <Divider />

        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12}>
            <div className="flex gap-3">
              <User className="text-dark-300 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Origem / Pagador</p>
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
          {transaction.person && (
            <Col xs={24} sm={12}>
              <div className="flex gap-3">
                <User className="text-dark-300 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">Doador</p>
                  <p className="text-base font-medium text-dark-900">{transaction.person.name}</p>
                </div>
              </div>
            </Col>
          )}
        </Row>

        {attachments.length > 0 && (
          <>
            <Divider />
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3">Anexos</p>
            <div className="space-y-2">
              {attachments.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openAttachment(a.id)}
                  className="w-full flex items-center gap-3 bg-dark-50 border border-dark-100 rounded-xl px-4 py-2.5 text-left hover:bg-dark-100 transition-colors"
                >
                  <Paperclip size={13} className="text-dark-400 shrink-0" />
                  <span className="flex-1 text-sm font-bold text-dark-700 truncate">{a.fileName}</span>
                  <span className="text-xs text-dark-400 shrink-0">{(a.sizeBytes / 1024).toFixed(0)} KB</span>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
