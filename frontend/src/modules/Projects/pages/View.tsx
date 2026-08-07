import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Progress } from 'antd';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  Target,
  Clock,
  DollarSign,
  Handshake,
  Heart,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsService, type Project } from '../services/projects.service';

// ============================================================
// HELPERS
// ============================================================

const statusConfig: Record<string, { text: string; classes: string }> = {
  active:    { text: 'Em Andamento', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  planning:  { text: 'Planejamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { text: 'Concluído',    classes: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  blocked:   { text: 'Bloqueado',    classes: 'bg-red-50 text-red-600 border-red-200' },
  draft:     { text: 'Rascunho',     classes: 'bg-dark-50 text-dark-400 border-dark-200' },
  canceled:  { text: 'Cancelado',    classes: 'bg-dark-50 text-dark-400 border-dark-200' },
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
};

export default function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectsService.getById(id);
        setProject(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Projeto não encontrado.' });
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Skeleton.Button active size="large" />
          <Skeleton active paragraph={{ rows: 1 }} title={{ width: 280 }} />
        </div>
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '20px' }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!project) return null;

  const cfg = statusConfig[project.status] ?? { text: project.status, classes: 'bg-dark-50 text-dark-400 border-dark-200' };
  const teamMembers = project.teamMembers ?? [];
  const volunteers  = project.volunteers  ?? [];
  const allMembers  = [...teamMembers, ...volunteers];
  const partners    = (project.partners ?? []).filter((p) => p.partnershipType === 'Parceiro');
  const suppliers   = (project.partners ?? []).filter((p) => p.partnershipType === 'Fornecedor');
  const donors      = project.donors ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
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
              <Tag className={`px-3 py-1 rounded-full border font-bold text-xs uppercase tracking-wide m-0 ${cfg.classes}`}>
                {cfg.text}
              </Tag>
            </div>
            <p className="text-dark-400 text-sm mt-1 flex items-center gap-2">
              <span className="font-medium text-dark-600">ID:</span> PRJ-{project.id.slice(-6).toUpperCase()}
              <Divider type="vertical" className="bg-dark-200" />
              Liderado por <strong className="text-dark-700">{project.manager?.name ?? '—'}</strong>
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

      {/* Métricas Rápidas */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        <Col xs={24} sm={6}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Membros</p>
                <h3 className="text-2xl font-bold text-dark-900 leading-tight">{allMembers.length}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">No projeto</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600">
                <Users size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Parceiros</p>
                <h3 className="text-2xl font-bold text-dark-900 leading-tight">{partners.length + suppliers.length}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">e fornecedores</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-secondary-50 text-secondary-600">
                <Handshake size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Orçamento</p>
                <h3 className="text-xl font-bold text-dark-900 leading-tight">
                  {project.budget != null
                    ? project.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : '—'}
                </h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Total planejado</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                <DollarSign size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-3">
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Início</p>
                <h3 className="text-base font-bold text-dark-900 leading-tight">{formatDate(project.startDate)}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">
                  Término: {formatDate(project.endDate)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-dark-50 text-dark-600 shrink-0">
                <Clock size={24} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Barra de Progresso */}
      {project.progress !== undefined && (
        <Card className="rounded-2xl shadow-soft border-dark-100 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100" bodyStyle={{ padding: '24px' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-dark-700">Progresso Geral do Projeto</span>
            <span className="text-sm font-bold text-dark-900">{project.progress}%</span>
          </div>
          <Progress
            percent={project.progress}
            showInfo={false}
            strokeColor={project.progress === 100 ? '#1D9D19' : '#054EC0'}
            trailColor="#F1F5F9"
            strokeWidth={10}
          />
        </Card>
      )}

      {/* Grid Principal */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {/* Coluna Esquerda */}
        <Col xs={24} lg={16} className="space-y-6">
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-4 text-dark-900">
              <Target size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold">Objetivos e Descrição</h2>
            </div>
            {project.description ? (
              <p className="text-dark-600 leading-relaxed">{project.description}</p>
            ) : (
              <p className="text-dark-400 italic">Nenhuma descrição informada.</p>
            )}
          </Card>

          {(partners.length > 0 || suppliers.length > 0 || donors.length > 0) && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <div className="flex items-center gap-2 mb-4 text-dark-900">
                <Handshake size={20} className="text-secondary-500" />
                <h2 className="text-lg font-bold">Parceiros e Apoiadores</h2>
              </div>

              {partners.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Parceiros</p>
                  <div className="flex flex-wrap gap-2">
                    {partners.map((p) => (
                      <Tag key={p.id} className="rounded-full bg-secondary-50 text-secondary-700 border-secondary-200 font-bold px-3 py-1">
                        {p.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {suppliers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Fornecedores</p>
                  <div className="flex flex-wrap gap-2">
                    {suppliers.map((s) => (
                      <Tag key={s.id} className="rounded-full bg-blue-50 text-blue-700 border-blue-200 font-bold px-3 py-1">
                        {s.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {donors.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Doadores</p>
                  <div className="flex flex-wrap gap-2">
                    {donors.map((d) => (
                      <Tag key={d.id} className="rounded-full bg-green-50 text-green-700 border-green-200 font-bold px-3 py-1">
                        {d.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </Col>

        {/* Coluna Direita */}
        <Col xs={24} lg={8} className="space-y-6">
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-base font-bold text-dark-900 mb-4">Cronograma</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-dark-50 flex items-center justify-center text-dark-500 shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">Data de Início</p>
                  <p className="text-sm font-bold text-dark-900">{formatDate(project.startDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-dark-50 flex items-center justify-center text-dark-500 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">Previsão de Término</p>
                  <p className="text-sm font-bold text-dark-900">{formatDate(project.endDate)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Membros do Projeto */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '0' }}>
            <div className="p-5 border-b border-dark-100">
              <h3 className="text-base font-bold text-dark-900">
                Membros ({allMembers.length})
              </h3>
            </div>
            {allMembers.length === 0 ? (
              <div className="p-5 text-center text-dark-400 text-sm">
                Nenhum membro vinculado.
              </div>
            ) : (
              <div className="p-2 max-h-[300px] overflow-auto">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 hover:bg-dark-50 rounded-xl transition-colors cursor-pointer group">
                    <Avatar
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=0047AF`}
                      size="large"
                      className="border border-dark-100 shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-bold text-dark-900 group-hover:text-primary-600 transition-colors">{m.name}</p>
                      <p className="text-xs text-dark-400 font-medium">Equipe interna</p>
                    </div>
                  </div>
                ))}
                {volunteers.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 hover:bg-dark-50 rounded-xl transition-colors cursor-pointer group">
                    <Avatar
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.name)}&backgroundColor=026B11`}
                      size="large"
                      className="border border-dark-100 shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-bold text-dark-900 group-hover:text-primary-600 transition-colors">{v.name}</p>
                      <p className="text-xs text-dark-400 font-medium">Voluntário</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {donors.length > 0 && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-green-600" />
                <h3 className="text-base font-bold text-dark-900">Doadores ({donors.length})</h3>
              </div>
              <div className="space-y-2">
                {donors.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-dark-800">{d.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
