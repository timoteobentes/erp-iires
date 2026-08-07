import { useEffect, useRef, useState } from 'react';
import { Card, Button, Table, Row, Col, Avatar, Tooltip, Tag, Skeleton } from 'antd';
import {
  TrendingUp,
  Briefcase,
  Users,
  Download,
  ArrowUpRight,
  Calendar,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import { transactionsService, type MonthlySummary } from '../../Finance/services/transactions.service';
import { projectsService, type Project } from '../../Projects/services/projects.service';
import { volunteersService } from '../../People/services/volunteers.service';

// ============================================================
// HELPERS
// ============================================================
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const statusConfig: Record<string, { text: string; classes: string }> = {
  active: { text: 'Em Andamento', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  planning: { text: 'Planejamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { text: 'Concluído', classes: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  blocked: { text: 'Bloqueado', classes: 'bg-red-50 text-red-600 border-red-200' },
  draft: { text: 'Rascunho', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const barChartRef = useRef<HTMLDivElement>(null);
  const donutChartRef = useRef<HTMLDivElement>(null);

  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [kpis, setKpis] = useState({
    totalIncome: 0,
    balance: 0,
    activeProjects: 0,
    activeVolunteers: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectStatusCounts, setProjectStatusCounts] = useState({
    active: 0,
    completed: 0,
    other: 0,
    total: 0,
  });

  // --------------------------------------------------------
  // Carrega dados da API
  // --------------------------------------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summary, monthly, projects, volunteers] = await Promise.all([
          transactionsService.getSummary(),
          transactionsService.getMonthlySummary(),
          projectsService.list(),
          volunteersService.list(),
        ]);

        const activeProjects = projects.filter((p) => p.status === 'active').length;
        const completedProjects = projects.filter((p) => p.status === 'completed').length;
        const otherProjects = projects.length - activeProjects - completedProjects;
        const activeVolunteers = volunteers.filter((v) => v.status === 'active').length;

        setKpis({
          totalIncome: summary.totalIncome,
          balance: summary.balance,
          activeProjects,
          activeVolunteers,
        });
        setMonthlyData(monthly);
        setRecentProjects(projects.slice(0, 4));
        setProjectStatusCounts({
          active: activeProjects,
          completed: completedProjects,
          other: otherProjects,
          total: projects.length,
        });
      } catch {
        // silencia erros
      } finally {
        setLoadingKPIs(false);
      }
    };
    fetchAll();
  }, []);

  // --------------------------------------------------------
  // Gráfico de Barras (Captação vs Investimento)
  // --------------------------------------------------------
  useEffect(() => {
    if (!barChartRef.current || monthlyData.length === 0) return;

    const barChart = echarts.init(barChartRef.current);
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#ffffff',
        borderColor: '#ebecef',
        textStyle: { color: '#313450' },
        formatter: (params: any) => {
          let result = `<strong>${params[0]?.axisValueLabel}</strong><br/>`;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: <strong>${fmt(p.value)}</strong><br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['Captação', 'Investimento'],
        bottom: 0,
        icon: 'circle',
        itemGap: 24,
        textStyle: { color: '#586178', fontWeight: 500 },
      },
      grid: { left: '0%', right: '0%', bottom: '12%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: monthlyData.map((m) => m.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#7a8296', margin: 16 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#ebecef' } },
        axisLabel: { color: '#7a8296', formatter: (v: number) => fmt(v) },
      },
      series: [
        {
          name: 'Captação',
          type: 'bar',
          barWidth: '20%',
          itemStyle: { color: '#009082', borderRadius: [4, 4, 0, 0] },
          data: monthlyData.map((m) => m.income),
        },
        {
          name: 'Investimento',
          type: 'bar',
          barWidth: '20%',
          itemStyle: { color: '#054EC0', borderRadius: [4, 4, 0, 0] },
          data: monthlyData.map((m) => m.expense),
        },
      ],
    });

    const handleResize = () => barChart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      barChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [monthlyData]);

  // --------------------------------------------------------
  // Gráfico Donut (Status dos Projetos)
  // --------------------------------------------------------
  useEffect(() => {
    if (!donutChartRef.current || projectStatusCounts.total === 0) return;

    const donutChart = echarts.init(donutChartRef.current);
    donutChart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#E3E6EA',
        textStyle: { color: '#001F3D' },
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: false,
          itemStyle: { borderColor: '#fff', borderWidth: 4, borderRadius: 10 },
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: projectStatusCounts.active, name: 'Em Andamento', itemStyle: { color: '#009082' } },
            { value: projectStatusCounts.completed, name: 'Concluídos', itemStyle: { color: '#054EC0' } },
            { value: projectStatusCounts.other, name: 'Outros', itemStyle: { color: '#FFC107' } },
          ].filter((d) => d.value > 0),
        },
      ],
    });

    const handleResize = () => donutChart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      donutChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [projectStatusCounts]);

  // --------------------------------------------------------
  // Colunas da tabela de projetos
  // --------------------------------------------------------
  const tableColumns = [
    {
      title: 'Projeto',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/projects/${record.id}`)}
        >
          <p className="font-semibold text-dark-900 hover:text-primary-600 transition-colors">{name}</p>
          {record.description && (
            <p className="text-xs text-dark-400 truncate max-w-xs">{record.description}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Responsável',
      key: 'manager',
      render: (_: any, record: Project) => (
        <span className="text-dark-500 font-medium">{record.manager?.name ?? '—'}</span>
      ),
    },
    {
      title: 'Voluntários',
      key: 'volunteers',
      render: (_: any, record: Project) => (
        <Avatar.Group
          maxCount={3}
          size="small"
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}
        >
          {(record.volunteers ?? []).map((v) => (
            <Tooltip title={v.name} key={v.id} placement="top">
              <Avatar
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.name)}&backgroundColor=0047AF`}
              />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Project) => {
        const cfg = statusConfig[record.status] ?? { text: record.status, classes: 'bg-dark-50 text-dark-400 border-dark-200' };
        return (
          <Tag className={`px-3 py-0.5 rounded-full border font-bold uppercase text-[10px] ${cfg.classes}`}>
            {cfg.text}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Visão Geral</h1>
          <p className="text-dark-400 text-sm mt-1">Acompanhe os indicadores reais de impacto social.</p>
        </div>
        <div className="flex gap-3">
          <Button
            icon={<Calendar size={16} />}
            className="rounded-xl border-dark-100 text-dark-600 font-medium"
            onClick={() => navigate('/finance')}
          >
            Financeiro
          </Button>
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl shadow-soft font-bold"
            onClick={() => navigate('/reports')}
          >
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]}>
        {loadingKPIs
          ? [1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Card className="rounded-2xl shadow-soft border-dark-100">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))
          : [
              {
                title: 'Total Captado',
                value: fmt(kpis.totalIncome),
                growth: 'Receitas confirmadas',
                icon: <TrendingUp size={24} className="text-primary-600" />,
                bg: 'bg-primary-50',
              },
              {
                title: 'Saldo Atual',
                value: fmt(kpis.balance),
                growth: 'Captado − Investido',
                icon: <Wallet size={24} className="text-secondary-600" />,
                bg: 'bg-secondary-50',
              },
              {
                title: 'Projetos Ativos',
                value: String(kpis.activeProjects),
                growth: `de ${projectStatusCounts.total} projetos`,
                icon: <Briefcase size={24} className="text-warning" />,
                bg: 'bg-yellow-50',
              },
              {
                title: 'Voluntários Ativos',
                value: String(kpis.activeVolunteers),
                growth: 'Engajados no sistema',
                icon: <Users size={24} className="text-success" />,
                bg: 'bg-green-50',
              },
            ].map((stat, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-dark-400 text-sm font-semibold mb-1 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold text-dark-900 tracking-tight">{stat.value}</h3>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary-600">
                    <ArrowUpRight size={16} />
                    <span className="text-dark-400 font-normal italic text-xs">{stat.growth}</span>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {/* Gráficos */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        {/* Gráfico de Barras */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-dark-900">Captação vs Investimento</h3>
              <Tag className="rounded-full border-none bg-dark-50 text-dark-600 font-medium px-3 py-1">
                Últimos 6 meses
              </Tag>
            </div>
            <div className="flex-1 w-full relative min-h-[300px]">
              {monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                  Nenhum dado de transações ainda.
                </div>
              ) : (
                <div ref={barChartRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
              )}
            </div>
          </Card>
        </Col>

        {/* Gráfico Donut */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full">
            <h3 className="text-lg font-bold text-dark-900 mb-6">Status dos Projetos</h3>

            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="w-full relative h-[220px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-3xl font-bold text-dark-900 leading-none">
                    {projectStatusCounts.total}
                  </span>
                  <span className="text-xs font-medium text-dark-400 uppercase tracking-wide mt-1">Total</span>
                </div>
                {projectStatusCounts.total === 0 ? (
                  <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                    Nenhum projeto cadastrado.
                  </div>
                ) : (
                  <div ref={donutChartRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
                )}
              </div>

              <div className="w-full mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />Em Andamento
                  </div>
                  <span className="font-bold text-dark-900">{projectStatusCounts.active}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium">
                    <div className="w-3 h-3 rounded-full bg-secondary-500" />Concluídos
                  </div>
                  <span className="font-bold text-dark-900">{projectStatusCounts.completed}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium">
                    <div className="w-3 h-3 rounded-full bg-warning" />Outros
                  </div>
                  <span className="font-bold text-dark-900">{projectStatusCounts.other}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabela de Projetos Recentes */}
      <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-dark-900">Projetos Atualizados Recentemente</h3>
          <Button
            type="link"
            className="text-secondary-500 font-bold hover:text-secondary-600"
            onClick={() => navigate('/projects')}
          >
            Ver todos os projetos
          </Button>
        </div>

        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table
            columns={tableColumns}
            dataSource={recentProjects}
            rowKey="id"
            loading={loadingKPIs}
            pagination={false}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}
