import { useEffect, useRef } from 'react';
import {  Row, Col, Card, Button, Table, Tag } from 'antd';
import { 
  Activity,
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Download,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';

export default function FinanceOverview() {
  const navigate = useNavigate();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let myChart: echarts.ECharts | undefined;

    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#ffffff',
          borderColor: '#ebecef',
          textStyle: { color: '#313450' },
          axisPointer: { type: 'cross', label: { backgroundColor: '#313450' } }
        },
        legend: {
          data: ['Entradas', 'Saídas'],
          bottom: 0,
          icon: 'circle'
        },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#7a8296' }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#ebecef' } },
          axisLabel: { color: '#7a8296' }
        },
        series: [
          {
            name: 'Entradas',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: [12000, 19000, 15000, 22000, 18000, 25000],
            itemStyle: { color: '#389334' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(56, 147, 52, 0.2)' },
                { offset: 1, color: 'rgba(56, 147, 52, 0)' }
              ])
            }
          },
          {
            name: 'Saídas',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: [10000, 12000, 14000, 15000, 13000, 17000],
            itemStyle: { color: '#0047AF' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 71, 175, 0.2)' },
                { offset: 1, color: 'rgba(0, 71, 175, 0)' }
              ])
            }
          }
        ]
      });
    }

    const handleResize = () => myChart?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      myChart?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const recentTransactions = [
    { id: '1', description: 'Doação Mensal - Empresa X', category: 'Captação', date: '22/04/2026', value: 5000, type: 'income' },
    { id: '2', description: 'Aluguel Sede', category: 'Operacional', date: '20/04/2026', value: -3200, type: 'expense' },
    { id: '3', description: 'Compra Sementes - Inovação Verde', category: 'Projeto', date: '18/04/2026', value: -1500, type: 'expense' },
    { id: '4', description: 'Edital Municipal - Parcela 2', category: 'Subvenção', date: '15/04/2026', value: 12000, type: 'income' },
  ];

  const columns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      className: 'font-semibold text-dark-900',
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag className="rounded-full bg-dark-50 text-dark-600 border-none px-3">{cat}</Tag>
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      className: 'text-dark-400',
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      key: 'value',
      align: 'right' as const,
      render: (val: number) => (
        <span className={`font-bold ${val > 0 ? 'text-primary-600' : 'text-red-500'}`}>
          {val > 0 ? '+' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Financeiro</h1>
          <p className="text-dark-400 text-sm mt-1">Visão consolidada do fluxo de caixa e saúde financeira.</p>
        </div>
        <div className="flex gap-3">
          <Button icon={<Calendar size={16} />} className="rounded-xl border-dark-100 text-dark-600 font-medium">Abril, 2026</Button>
          <Button type="primary" icon={<Download size={16} />} className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl shadow-soft font-bold">Exportar PDF</Button>
        </div>
      </div>

      {/* Cards de Saldo e Fluxo */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        {[
          { title: 'Saldo em Conta', value: 'R$ 84.250,00', sub: 'Disponível hoje', icon: <Wallet size={24} className="text-secondary-600" />, bg: 'bg-secondary-50' },
          { title: 'Entradas (Mês)', value: 'R$ 32.400,00', sub: '+18% vs mês ant.', icon: <ArrowUpCircle size={24} className="text-primary-600" />, bg: 'bg-primary-50' },
          { title: 'Saídas (Mês)', value: 'R$ 14.200,00', sub: '-5% vs mês ant.', icon: <ArrowDownCircle size={24} className="text-red-500" />, bg: 'bg-red-50' },
          { title: 'Previsão de Saldo', value: 'R$ 102.450,00', sub: 'Fim do período', icon: <DollarSign size={24} className="text-warning" />, bg: 'bg-yellow-50' },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-all p-1" bodyStyle={{ padding: '20px' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-dark-900 leading-tight">{stat.value}</h3>
                  <p className={`text-xs mt-1 font-medium ${idx === 1 ? 'text-primary-600' : idx === 2 ? 'text-red-500' : 'text-dark-400'}`}>{stat.sub}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Gráfico de Fluxo de Caixa */}
      <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150" bodyStyle={{ padding: '32px' }}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-secondary-500" />
            <h2 className="text-lg font-bold text-dark-900">Fluxo de Caixa Mensal</h2>
          </div>
          <Button type="text" className="text-secondary-500 font-bold flex items-center gap-1">Ver Relatório Completo <ArrowRight size={16} /></Button>
        </div>
        <div ref={chartRef} style={{ width: '100%', height: '350px' }}></div>
      </Card>

      {/* Últimas Transações */}
      <Card 
        className="rounded-2xl shadow-soft border-dark-100 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 delay-200" 
        bodyStyle={{ padding: 0 }}
        title={<div className="flex items-center gap-2"><div className="w-1.5 h-6 bg-primary-500 rounded-full"></div><span className="font-bold">Últimas Transações</span></div>}
        extra={<Button type="link" className="font-bold text-secondary-500" onClick={() => navigate('/finance/receivables')}>Ver todas</Button>}
      >
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5">
          <Table 
            columns={columns} 
            dataSource={recentTransactions} 
            rowKey="id"
            pagination={false}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}