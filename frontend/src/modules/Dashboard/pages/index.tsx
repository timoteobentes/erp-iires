import { useEffect, useRef } from 'react';
import { Card, Button, Table, Row, Col, Avatar, Tooltip, Tag } from 'antd';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  Clock, 
  ArrowUpRight, 
  Download,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Refs para os containers dos gráficos
  const barChartRef = useRef<HTMLDivElement>(null);
  const donutChartRef = useRef<HTMLDivElement>(null);

  // Efeito para inicializar e gerenciar os gráficos ECharts nativos
  useEffect(() => {
    let barChart: echarts.ECharts | undefined;
    let donutChart: echarts.ECharts | undefined;

    // Inicializa Gráfico de Barras
    if (barChartRef.current) {
      barChart = echarts.init(barChartRef.current);
      barChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#ffffff',
          borderColor: '#ebecef',
          textStyle: { color: '#313450' }
        },
        legend: {
          data: ['Captação', 'Investimento'],
          bottom: 0,
          icon: 'circle',
          itemGap: 24,
          textStyle: { color: '#586178', fontWeight: 500 }
        },
        grid: { left: '0%', right: '0%', bottom: '12%', top: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#7a8296', margin: 16 }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#ebecef' } },
          axisLabel: { color: '#7a8296' }
        },
        series: [
          {
            name: 'Captação',
            type: 'bar',
            barWidth: '20%',
            itemStyle: { color: '#389334', borderRadius: [4, 4, 0, 0] },
            data: [120000, 132000, 101000, 134000, 90000, 230000, 210000]
          },
          {
            name: 'Investimento',
            type: 'bar',
            barWidth: '20%',
            itemStyle: { color: '#0047AF', borderRadius: [4, 4, 0, 0] },
            data: [80000, 90000, 60000, 110000, 70000, 180000, 150000]
          }
        ]
      });
    }

    // Inicializa Gráfico de Donut
    if (donutChartRef.current) {
      donutChart = echarts.init(donutChartRef.current);
      donutChart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: '#ffffff',
          borderColor: '#ebecef',
          textStyle: { color: '#313450' }
        },
        series: [
          {
            name: 'Status',
            type: 'pie',
            radius: ['65%', '85%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 4,
              borderRadius: 10
            },
            label: { show: false },
            labelLine: { show: false },
            data: [
              { value: 8, name: 'Em Andamento', itemStyle: { color: '#389334' } },
              { value: 3, name: 'Concluídos', itemStyle: { color: '#0047AF' } },
              { value: 1, name: 'Aguardando', itemStyle: { color: '#FFC107' } }
            ]
          }
        ]
      });
    }

    // Função de responsividade premium
    const handleResize = () => {
      barChart?.resize();
      donutChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: destrói a instância ao desmontar o componente para evitar vazamento de memória
    return () => {
      barChart?.dispose();
      donutChart?.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const recentProjects = [
    { id: '1', name: 'Inovação Verde', manager: 'Ana Silva', progress: 75, team: ['Ana', 'Beto', 'Carla'] },
    { id: '2', name: 'Educação Tech', manager: 'Carlos Mendes', progress: 100, team: ['Carlos', 'Diana'] },
    { id: '3', name: 'Água Limpa', manager: 'Mariana Costa', progress: 30, team: ['Mari', 'João', 'Pedro', 'Sofia'] },
    { id: '4', name: 'Cultura Inclusiva', manager: 'João Pedro', progress: 10, team: ['João'] },
  ];

  const tableColumns = [
    {
      title: 'Projeto Recente',
      dataIndex: 'name',
      key: 'name',
      className: 'font-semibold text-dark-900',
    },
    {
      title: 'Responsável',
      dataIndex: 'manager',
      key: 'manager',
      className: 'text-dark-500 font-medium',
    },
    {
      title: 'Equipe',
      key: 'team',
      render: (_: any, record: any) => (
        <Avatar.Group 
          maxCount={3} 
          size="small" 
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' }}
        >
          {record.team.map((member: string, i: number) => (
            <Tooltip title={member} key={i} placement="top">
              <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`} />
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'Progresso',
      key: 'progress',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 bg-dark-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                record.progress === 100 ? 'bg-secondary-500' : record.progress < 20 ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${record.progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-dark-700 min-w-[45px] text-right">
            {record.progress}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 tracking-tight">Visão Geral</h1>
          <p className="text-dark-400 text-sm mt-1">Acompanhe os indicadores reais de impacto social.</p>
        </div>
        <div className="flex gap-3">
          <Button icon={<Calendar size={16} />} className="rounded-xl border-dark-100 text-dark-600 font-medium">
            Este Mês
          </Button>
          <Button type="primary" icon={<Download size={16} />} className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl shadow-soft font-bold">
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <Row gutter={[24, 24]}>
        {[
          { title: 'Total Arrecadado', value: 'R$ 450.200', growth: '+12.5%', icon: <TrendingUp size={24} className="text-primary-600" />, bg: 'bg-primary-50' },
          { title: 'Projetos Ativos', value: '12', growth: '+2 novos', icon: <Briefcase size={24} className="text-secondary-600" />, bg: 'bg-secondary-50' },
          { title: 'Beneficiários', value: '3.450', growth: '+15%', icon: <Users size={24} className="text-warning" />, bg: 'bg-yellow-50' },
          { title: 'Horas Voluntárias', value: '1.280h', growth: '+5.2%', icon: <Clock size={24} className="text-success" />, bg: 'bg-green-50' },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="rounded-2xl shadow-soft border-dark-100 hover:shadow-card transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-dark-400 text-sm font-semibold mb-1 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-dark-900 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary-600">
                <ArrowUpRight size={16} />
                <span>{stat.growth}</span>
                <span className="text-dark-300 ml-1 font-normal italic text-xs">vs. mês anterior</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Gráficos Reais com ECharts Nativo */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        
        {/* Gráfico de Barras */}
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full" bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-dark-900">Captação vs Investimento</h3>
              <Tag className="rounded-full border-none bg-dark-50 text-dark-600 font-medium px-3 py-1">2026</Tag>
            </div>
            
            <div className="flex-1 w-full relative min-h-[300px]">
              {/* O ref é passado para essa div onde o ECharts injeta o canvas */}
              <div ref={barChartRef} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
            </div>
          </Card>
        </Col>

        {/* Gráfico Donut */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full">
            <h3 className="text-lg font-bold text-dark-900 mb-6">Status dos Projetos</h3>
            
            <div className="flex flex-col items-center justify-center py-2 relative">
              <div className="w-full relative h-[220px]">
                
                {/* Legenda central absoluta */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-3xl font-bold text-dark-900 leading-none">12</span>
                  <span className="text-xs font-medium text-dark-400 uppercase tracking-wide mt-1">Total</span>
                </div>
                
                {/* Ref do Donut */}
                <div ref={donutChartRef} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
              </div>

              <div className="w-full mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium"><div className="w-3 h-3 rounded-full bg-primary-500"></div>Em Andamento</div>
                  <span className="font-bold text-dark-900">65%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium"><div className="w-3 h-3 rounded-full bg-secondary-500"></div>Concluídos</div>
                  <span className="font-bold text-dark-900">25%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-dark-600 font-medium"><div className="w-3 h-3 rounded-full bg-warning"></div>Aguardando</div>
                  <span className="font-bold text-dark-900">10%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabela de Projetos Atualizados */}
      <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="p-6 border-b border-dark-100 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-dark-900">Projetos Atualizados Recentemente</h3>
          <Button type="link" className="text-secondary-500 font-bold hover:text-secondary-600" onClick={() => navigate('/projects')}>
            Ver todos os projetos
          </Button>
        </div>
        
        <div className="[&_thead_th]:!bg-dark-50 [&_thead_th]:!text-dark-600 [&_thead_th]:!font-bold [&_thead_th]:!py-5 [&_thead_th]:!border-b [&_thead_th]:!border-dark-100">
          <Table 
            columns={tableColumns} 
            dataSource={recentProjects} 
            rowKey="id"
            pagination={false}
            className="ant-table-premium"
          />
        </div>
      </Card>
    </div>
  );
}