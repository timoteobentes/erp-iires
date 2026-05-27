import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification } from 'antd';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  Target,
  Clock,
  MapPin,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsService, type Project } from '../services/projects.service';

// ============================================================
// HELPERS
// ============================================================

const statusConfig: Record<string, { text: string; classes: string }> = {
  active: { text: 'Em Andamento', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
  planning: { text: 'Planejamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { text: 'Concluído', classes: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  blocked: { text: 'Bloqueado', classes: 'bg-red-50 text-red-600 border-red-200' },
  draft: { text: 'Rascunho', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
  canceled: { text: 'Cancelado', classes: 'bg-dark-50 text-dark-400 border-dark-200' },
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

  // --------------------------------------------------------
  // Busca o projeto pelo id
  // --------------------------------------------------------
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

  // --------------------------------------------------------
  // Skeleton
  // --------------------------------------------------------
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
  const volunteers = project.volunteers ?? [];
  const partners = project.partners ?? [];

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
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Voluntários</p>
                <h3 className="text-2xl font-bold text-dark-900 leading-tight">{volunteers.length}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Na equipe</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600">
                <Users size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Parceiros</p>
                <h3 className="text-2xl font-bold text-dark-900 leading-tight">{partners.length}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Institucionais</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-secondary-50 text-secondary-600">
                <MapPin size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">Início</p>
                <h3 className="text-xl font-bold text-dark-900 leading-tight">{formatDate(project.startDate)}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">
                  Término: {formatDate(project.endDate)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-dark-50 text-dark-600">
                <Clock size={24} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

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

          {partners.length > 0 && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <h2 className="text-lg font-bold text-dark-900 mb-4">Parceiros e Fornecedores</h2>
              <div className="flex flex-wrap gap-2">
                {partners.map((p) => (
                  <Tag key={p.id} className="rounded-full bg-secondary-50 text-secondary-700 border-secondary-200 font-bold px-3 py-1">
                    {p.name}
                  </Tag>
                ))}
              </div>
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

          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '0' }}>
            <div className="p-5 border-b border-dark-100">
              <h3 className="text-base font-bold text-dark-900">
                Equipe ({volunteers.length} voluntários)
              </h3>
            </div>
            {volunteers.length === 0 ? (
              <div className="p-5 text-center text-dark-400 text-sm">
                Nenhum voluntário vinculado.
              </div>
            ) : (
              <div className="p-2 max-h-[300px] overflow-auto">
                {volunteers.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 hover:bg-dark-50 rounded-xl transition-colors cursor-pointer group">
                    <Avatar
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.name)}&backgroundColor=0047AF`}
                      size="large"
                      className="border border-dark-100 shadow-sm"
                    />
                    <div>
                      <p className="text-sm font-bold text-dark-900 group-hover:text-primary-600 transition-colors">{v.name}</p>
                      <p className="text-xs text-dark-400 font-medium">
                        {i === 0 ? 'Voluntário líder' : 'Voluntário'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
