import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Tag, Modal, Space, Card, Tooltip, Select, Row, Col, Empty, notification } from 'antd';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { transactionsService, type Transaction } from '../../services/transactions.service';

// ============================================================
// HELPERS
// ============================================================

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const getStatusConfig = (status: string) => ({
  PAID: { text: 'Pago', classes: 'bg-primary-50 text-primary-600 border-primary-200', icon: <CheckCircle size={12} /> },
  PENDING: { text: 'Pendente', classes: 'bg-yellow-50 text-warning border-yellow-200', icon: <Calendar size={12} /> },
  CANCELED: { text: 'Cancelado', classes: 'bg-dark-50 text-dark-400 border-dark-200', icon: <AlertTriangle size={12} /> },
}[status] ?? { text: status, classes: 'bg-dark-50 text-dark-400 border-dark-200', icon: null });

export default function PayablesList() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca transações da API (apenas EXPENSE)
  // --------------------------------------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const all = await transactionsService.list();
      setTransactions(all.filter((t) => t.type === 'EXPENSE'));
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível carregar as despesas.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --------------------------------------------------------
  // Filtros client-side
  // --------------------------------------------------------
  const filtered = transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const categories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));

  // --------------------------------------------------------
  // Cancelar despesa
  // --------------------------------------------------------
  const handleDelete = (id: string, title: string) => {
    Modal.confirm({
      title: 'Cancelar Conta',
      content: (
        <div>
          Tem certeza que deseja cancelar o lançamento{' '}
          <strong className="text-dark-900">{title}</strong>?
        </div>
      ),
      okText: 'Sim, cancelar',
      okType: 'danger',
      centered: true,
      cancelText: 'Voltar',
      onOk: async () => {
        try {
          await transactionsService.cancel(id);
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: 'CANCELED' } : t)),
          );
          notification.success({ message: 'Conta cancelada com sucesso.' });
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível cancelar.' });
        }
      },
    });
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Descrição / Fornecedor',
      key: 'description',
      render: (_, record) => (
        <div>
          <p className="font-bold text-dark-900 leading-tight">{record.title}</p>
          <p className="text-xs text-dark-400 font-medium mt-0.5">
            {record.description || record.person?.name || '—'}
          </p>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <Tag className="rounded-lg bg-dark-50 border-none text-dark-600 font-medium px-3">{cat ?? '—'}</Tag>
      ),
    },
    {
      title: 'Data',
      key: 'date',
      render: (_, record) => (
        <span className="text-dark-500 font-medium">
          {new Date(record.date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      title: 'Valor',
      key: 'value',
      align: 'right',
      render: (_, record) => (
        <span className="font-bold text-dark-900">{fmt(record.amount)}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const cfg = getStatusConfig(record.status);
        return (
          <Tag
            className={`px-3 py-1 rounded-full border font-bold text-xs flex items-center justify-center gap-1.5 w-28 ${cfg.classes}`}
          >
            {cfg.icon} {cfg.text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalhes">
            <Button
              type="text"
              icon={<Eye size={18} />}
              onClick={() => navigate(`/finance/payables/${record.id}`)}
              className="text-dark-400 hover:text-secondary-500 transition-colors"
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/finance/payables/${record.id}/edit`)}
              className="text-dark-400 hover:text-primary-500 transition-colors"
            />
          </Tooltip>
          {record.status !== 'CANCELED' && (
            <Tooltip title="Cancelar">
              <Button
                type="text"
                icon={<Trash2 size={18} />}
                onClick={() => handleDelete(record.id, record.title)}
                className="text-dark-400 hover:text-red-500 transition-colors"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Contas a Pagar</h1>
          <p className="text-dark-400 text-sm mt-1">Controle de obrigações, pagamentos e fornecedores.</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          size="large"
          className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft flex items-center"
          onClick={() => navigate('/finance/payables/new')}
        >
          Nova Conta
        </Button>
      </div>

      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-96 relative">
            <Input
              placeholder="Buscar por descrição ou fornecedor..."
              prefix={<Search size={16} className="text-dark-300" />}
              className="rounded-xl w-full hover:border-secondary-400 focus:border-secondary-500 py-1.5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto gap-3 items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? <X size={18} /> : <Filter size={18} />}
              className={`flex items-center rounded-xl font-medium border-dark-200 h-[38px] transition-colors ${showFilters ? 'bg-dark-50 text-dark-900' : 'text-dark-600 hover:!text-secondary-500 hover:!border-secondary-400'}`}
            >
              Filtros Avançados
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Status</label>
                <Select
                  className="w-full"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'Todos os Status' },
                    { value: 'PENDING', label: 'Pendentes' },
                    { value: 'PAID', label: 'Pagos' },
                    { value: 'CANCELED', label: 'Cancelados' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1 block">Categoria</label>
                <Select
                  className="w-full"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: 'all', label: 'Todas as Categorias' },
                    ...categories.map((c) => ({ value: c as string, label: c as string })),
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={8} className="flex items-end">
                <Button
                  type="primary"
                  className="w-full bg-dark-900 hover:!bg-dark-800 rounded-lg h-8 font-medium"
                  onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                >
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      <Card
        className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150"
        bodyStyle={{ padding: 0 }}
      >
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            locale={{ emptyText: <Empty description="Nenhuma despesa encontrada" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            pagination={{
              pageSize: 10,
              className: 'px-6 py-4 border-t border-dark-100 m-0',
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} contas`,
            }}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}
