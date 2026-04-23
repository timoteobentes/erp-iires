import { Button, Card, Tag, Row, Col, Avatar, Divider } from 'antd';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Função auxiliar para máscara
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock de dados enriquecido para o MVP
  const project = {
    id,
    name: 'Inovação Verde',
    status: 'active',
    progress: 65,
    manager: 'Ana Silva',
    startDate: '10/01/2026',
    endDate: '20/12/2026',
    budget: 150000,
    spent: 85000,
    team: ['Ana', 'Beto', 'Carla', 'Diego'],
    description: 'Projeto voltado para o desenvolvimento de hortas comunitárias sustentáveis nas periferias, com foco na capacitação de jovens em situação de vulnerabilidade. O objetivo é criar polos de agricultura urbana que gerem renda e segurança alimentar.',
  };

  // Cálculo de orçamento
  const remainingBudget = project.budget - project.spent;
  const budgetPercentage = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Premium da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<ArrowLeft size={20} />} 
            onClick={() => navigate('/projects')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{project.name}</h1>
              <Tag className="px-3 py-1 rounded-full border font-bold text-xs uppercase tracking-wide bg-primary-50 text-primary-600 border-primary-200 m-0">
                Em Andamento
              </Tag>
            </div>
            <p className="text-dark-400 text-sm mt-1 flex items-center gap-2">
              <span className="font-medium text-dark-600">ID:</span> PRJ-{project.id?.padStart(4, '0')} 
              <Divider type="vertical" className="bg-dark-200" />
              Liderado por <strong className="text-dark-700">{project.manager}</strong>
            </p>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<Edit size={18} />} 
          onClick={() => navigate(`/projects/${id}/edit`)}
          className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft flex items-center px-6"
        >
          Editar Projeto
        </Button>
      </div>

      {/* Cards Superiores (Micro-Métricas) */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        {[
          { title: 'Progresso Geral', value: `${project.progress}%`, sub: 'Concluído', icon: <Activity size={24} className="text-primary-600" />, bg: 'bg-primary-50' },
          { title: 'Orçamento Total', value: formatCurrency(project.budget), sub: 'Aprovado', icon: <DollarSign size={24} className="text-secondary-600" />, bg: 'bg-secondary-50' },
          { title: 'Valor Executado', value: formatCurrency(project.spent), sub: `${budgetPercentage}% consumido`, icon: <CheckCircle2 size={24} className="text-success" />, bg: 'bg-green-50' },
          { title: 'Membros Ativos', value: project.team.length, sub: 'Na equipe', icon: <Users size={24} className="text-warning" />, bg: 'bg-yellow-50' },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-dark-900 leading-tight">{stat.value}</h3>
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

      {/* Área Central: Detalhes e Lateral */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        
        {/* Coluna Esquerda (Principal) */}
        <Col xs={24} lg={16} className="space-y-6">
          
          {/* Card de Descrição */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-4 text-dark-900">
              <Target size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold">Objetivos e Descrição</h2>
            </div>
            <p className="text-dark-600 leading-relaxed">
              {project.description}
            </p>
          </Card>

          {/* Card de Saúde Financeira */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-6 text-dark-900">
              <DollarSign size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold">Saúde Financeira</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-sm font-bold text-dark-900">{budgetPercentage}% Utilizado</span>
                  <p className="text-xs text-dark-400 font-medium">Restam {formatCurrency(remainingBudget)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-dark-400 font-medium uppercase tracking-wide">Orçamento Total</span>
                  <p className="text-sm font-bold text-dark-900">{formatCurrency(project.budget)}</p>
                </div>
              </div>
              
              {/* Barra de Progresso Financeiro Premium */}
              <div className="w-full bg-dark-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    budgetPercentage > 90 ? 'bg-red-500' : budgetPercentage > 75 ? 'bg-warning' : 'bg-secondary-500'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Coluna Direita (Sidebar Interna) */}
        <Col xs={24} lg={8} className="space-y-6">
          
          {/* Card de Prazos */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-base font-bold text-dark-900 mb-4">Cronograma</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-dark-50 flex items-center justify-center text-dark-500 shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">Data de Início</p>
                  <p className="text-sm font-bold text-dark-900">{project.startDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-dark-50 flex items-center justify-center text-dark-500 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">Previsão de Término</p>
                  <p className="text-sm font-bold text-dark-900">{project.endDate}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de Equipe */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '0' }}>
            <div className="p-5 border-b border-dark-100">
              <h3 className="text-base font-bold text-dark-900">Equipe do Projeto</h3>
            </div>
            <div className="p-2 max-h-[300px] overflow-auto custom-scrollbar">
              {project.team.map((member, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-dark-50 rounded-xl transition-colors cursor-pointer group">
                  <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`} size="large" className="border border-dark-100 shadow-sm" />
                  <div>
                    <p className="text-sm font-bold text-dark-900 group-hover:text-primary-600 transition-colors">{member}</p>
                    <p className="text-xs text-dark-400 font-medium">{i === 0 ? 'Líder do Projeto' : 'Voluntário'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-dark-100 bg-dark-50 rounded-b-2xl">
              <Button type="dashed" block className="rounded-xl border-dark-200 text-dark-600 font-medium hover:text-primary-600 hover:border-primary-400">
                + Adicionar Membro
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}