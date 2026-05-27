import { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Button, Table, Tag, Skeleton } from 'antd';
import {
  Activity,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import { transactionsService, type Transaction, type MonthlySummary } from '../services/transactions.service';

// ============================================================
// HELPER
// ============================================================
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusMap: Record<string, { text: string; color: string }> = {
  PAID: { text: 'Pago/Recebido', color: 'text-primary-600' },
  PENDING: { text: 'Pendente', color: 'text-warning' },
  CANCELED: { text: 'Cancelado', color: 'text-dark-400' },
};

export default function FinanceOverview() {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);

  // --------------------------------------------------------
  // Carrega dados da API
  // --------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, transactionsData, monthlyRaw] = await Promise.all([
          transactionsService.getSummary(),
          transactionsService.list(),
          transactionsService.getMonthlySummary(),
        ]);
        setSummary(summaryData);
        setRecentTransactions(transactionsData.filter((t) => t.status !== 'CANCELED').slice(0, 6));
        setMonthlyData(monthlyRaw);
      } catch {
        // silencia erros
      } finally {
        setLoadingSummary(false);
        setLoadingTransactions(false);
      }
    };
    fetchData();
  }, []);

  // --------------------------------------------------------
  // Inicializa gráfico ECharts
  // --------------------------------------------------------
  useEffect(() => {
    if (!chartRef.current || monthlyData.length === 0) return;

    const myChart = echarts.init(chartRef.current);
    myChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#ebecef',
        textStyle: { color: '#313450' },
        axisPointer: { type: 'cross', label: { backgroundColor: '#313450' } },
        formatter: (params: any) => {
          let result = `<strong>${params[0]?.axisValueLabel}</strong><br/>`;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: <strong>${fmt(p.value)}</strong><br/>`;
          });
          return result;
        },
      },
      legend: { data: ['Entradas', 'Saídas'], bottom: 0, icon: 'circle' },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: monthlyData.map((m) => m.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7a8296' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#ebecef' } },
        axisLabel: { color: '#7a8296', formatter: (v: number) => fmt(v) },
      },
      series: [
        {
          name: 'Entradas',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: monthlyData.map((m) => m.income),
          itemStyle: { color: '#389334' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 147, 52, 0.2)' },
              { offset: 1, color: 'rgba(56, 147, 52, 0)' },
            ]),
          },
        },
        {
          name: 'Saídas',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: monthlyData.map((m) => m.expense),
          itemStyle: { color: '#0047AF' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 71, 175, 0.2)' },
              { offset: 1, color: 'rgba(0, 71, 175, 0)' },
            ]),
          },
        },
      ],
    });

    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      myChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [monthlyData]);

  const columns = [
    {
      title: 'Descrição',
      key: 'description',
      render: (_: any, record: Transaction) => (
        <div>
          <p className="font-semibold text-dark-900 leading-tight">{record.title}</p>
          {record.description && (
            <p className="text-xs text-dark-400 font-medium mt-0.5">{record.description}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => (
        <Tag className="rounded-full bg-dark-50 text-dark-600 border-none px-3">{cat ?? '—'}</Tag>
      ),
    },
    {
      title: 'Data',
      key: 'date',
      render: (_: any, record: Transaction) => (
        <span className="text-dark-400">
          {new Date(record.date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      title: 'Valor',
      key: 'value',
      align: 'right' as const,
      render: (_: any, record: Transaction) => (
        <span className={`font-bold ${record.type === 'INCOME' ? 'text-primary-600' : 'text-red-500'}`}>
          {record.type === 'INCOME' ? '+' : '-'} {fmt(record.amount)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Financeiro</h1>
          <p className="text-dark-400 text-sm mt-1">Visão consolidada do fluxo de caixa e saúde financeira.</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl shadow-soft font-bold"
            onClick={() => navigate('/reports')}
          >
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        {loadingSummary
          ? [1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card className="rounded-2xl shadow-soft border-dark-100 p-1" bodyStyle={{ padding: '20px' }}>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))
          : [
              {
                title: 'Total Captado',
                value: fmt(summary.totalIncome),
                sub: 'Transações pagas',
                icon: <ArrowUpCircle size={24} className="text-primary-600" />,
                bg: 'bg-primary-50',
                textColor: '',
              },
              {
                title: 'Total Investido',
                value: fmt(summary.totalExpense),
                sub: 'Despesas pagas',
                icon: <ArrowDownCircle size={24} className="text-red-500" />,
                bg: 'bg-red-50',
                textColor: 'text-red-600',
              },
              {
                title: 'Saldo Líquido',
                value: fmt(summary.balance),
                sub: 'Captado − Investido',
                icon: <Wallet size={24} className="text-secondary-600" />,
                bg: 'bg-secondary-50',
                textColor: summary.balance >= 0 ? 'text-secondary-600' : 'text-red-600',
              },
              {
                title: 'Receitas vs Despesas',
                value: summary.totalIncome > 0
                  ? `${Math.round((summary.totalExpense / summary.totalIncome) * 100)}%`
                  : '—',
                sub: 'Taxa de comprometimento',
                icon: <DollarSign size={24} className="text-warning" />,
                bg: 'bg-yellow-50',
                textColor: '',
              },
            ].map((stat, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <Card
                  className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-all p-1"
                  bodyStyle={{ padding: '20px' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
                        {stat.title}
                      </p>
                      <h3 className={`text-2xl font-bold text-dark-900 leading-tight ${stat.textColor}`}>
                        {stat.value}
                      </h3>
                      <p className="text-dark-400 text-xs mt-1 font-medium">{stat.sub}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      {stat.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {/* Gráfico */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150"
        bodyStyle={{ padding: '32px' }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold text-dark-900">Fluxo de Caixa Mensal</h2>
          </div>
          <Button
            type="text"
            className="text-secondary-500 font-bold flex items-center gap-1"
            onClick={() => navigate('/reports')}
          >
            Ver Relatório Completo <ArrowRight size={16} />
          </Button>
        </div>
        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-dark-400">
            Nenhum dado de transações ainda.
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
        )}
      </Card>

      {/* Últimas Transações */}
      <Card
        className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 delay-200"
        bodyStyle={{ padding: 0 }}
        title={
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
            <span className="font-bold">Últimas Transações</span>
          </div>
        }
        extra={
          <Button
            type="link"
            className="font-bold text-secondary-500"
            onClick={() => navigate('/finance/receivables')}
          >
            Ver todas
          </Button>
        }
      >
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5">
          <Table
            columns={columns}
            dataSource={recentTransactions}
            rowKey="id"
            loading={loadingTransactions}
            pagination={false}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}
