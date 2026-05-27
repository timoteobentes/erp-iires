import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Modal } from 'antd';
import {
  ArrowLeft,
  Edit,
  MapPin,
  User,
  Heart,
  Star,
  Clock,
  Briefcase,
  PhoneCall,
  ShieldCheck,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { volunteersService, type Volunteer } from '../../services/volunteers.service';
import { normalizeCPF, normalizePhone, normalizeCEP } from '../../../../utils/masks';

export default function VolunteersView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca o voluntário pelo id da URL
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchVolunteer = async () => {
      try {
        setLoading(true);
        const data = await volunteersService.getById(id);
        setVolunteer(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Voluntário não encontrado.' });
        navigate('/people/volunteers');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id, navigate]);

  // --------------------------------------------------------
  // Inativar a partir da view
  // --------------------------------------------------------
  const handleInactivate = () => {
    if (!volunteer) return;

    Modal.confirm({
      title: 'Inativar Voluntário',
      content: (
        <div>
          Tem certeza que deseja inativar{' '}
          <strong className="text-dark-900">{volunteer.name}</strong>?<br />
          O histórico de horas doadas será mantido, mas ele ficará inativo na base.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await volunteersService.inactivate(volunteer.id);
          setVolunteer((prev) => (prev ? { ...prev, status: 'inactive' } : null));
          notification.success({ message: 'Voluntário inativado com sucesso.' });
        } catch {
          notification.error({
            message: 'Erro',
            description: 'Não foi possível inativar o voluntário.',
          });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Skeleton de carregamento
  // --------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-6">
          <Skeleton.Button active size="large" />
          <div className="flex items-center gap-5">
            <Skeleton.Avatar active size={80} />
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
          </div>
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
          <Col xs={24} lg={16} className="space-y-6">
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8} className="space-y-6">
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!volunteer) return null;

  const isActive = volunteer.status === 'active';
  const joinedAt = volunteer.createdAt
    ? new Date(volunteer.createdAt).toLocaleDateString('pt-BR')
    : '—';
  const birthDateFormatted = volunteer.birthDate
    ? new Date(volunteer.birthDate).toLocaleDateString('pt-BR')
    : '—';
  const termsDate = volunteer.createdAt
    ? new Date(volunteer.createdAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header do Perfil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/volunteers')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(volunteer.name)}`}
              className="border-2 border-white shadow-card bg-primary-50"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
                  {volunteer.name}
                </h1>
                <Tag
                  className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-dark-50 text-dark-400 border-dark-200'
                  }`}
                >
                  {isActive ? 'Disponível' : 'Indisponível'}
                </Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {volunteer.profession ?? 'Voluntário'}{' '}
                <Divider type="vertical" />{' '}
                <span className="text-primary-600 font-bold flex items-center gap-1">
                  <Heart size={14} className="fill-primary-100" /> Voluntário
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isActive && (
            <Button
              icon={<Trash2 size={18} />}
              onClick={handleInactivate}
              className="border-red-200 text-red-500 hover:!text-red-600 hover:!border-red-400 rounded-xl font-bold px-5 h-11 flex items-center"
            >
              Inativar
            </Button>
          )}
          <Button
            type="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/people/volunteers/${id}/edit`)}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Editar Ficha
          </Button>
        </div>
      </div>

      {/* Cards de Engajamento */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
        {[
          {
            title: 'Horas Doadas',
            value: `${volunteer.hoursDonated}h`,
            sub: 'Impacto total',
            icon: <Clock size={24} className="text-primary-600" />,
            bg: 'bg-primary-50',
          },
          {
            title: 'Projetos Ativos',
            value: volunteer.activeProjects,
            sub: 'Em andamento',
            icon: <Briefcase size={24} className="text-secondary-600" />,
            bg: 'bg-secondary-50',
          },
          {
            title: 'Desde',
            value: joinedAt,
            sub: 'Data de adesão',
            icon: <CalendarDays size={24} className="text-dark-600" />,
            bg: 'bg-dark-50',
          },
        ].map((stat, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <Card
              className="rounded-2xl shadow-soft border-dark-100 h-full p-1"
              bodyStyle={{ padding: '20px' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-dark-900 leading-tight">{stat.value}</h3>
                  <p className="text-dark-400 text-xs mt-1 font-medium">{stat.sub}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Área Central Dividida */}
      <Row
        gutter={[24, 24]}
        className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150"
      >
        {/* Coluna Esquerda: Dados Pessoais & Endereço */}
        <Col xs={24} lg={16} className="space-y-6">
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '32px' }}
          >
            <div className="flex items-center gap-2 mb-8">
              <User size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-dark-900">Informações Pessoais</h2>
            </div>

            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  CPF
                </p>
                <p className="text-base font-bold text-dark-900">
                  {normalizeCPF(volunteer.cpf ?? '') || '—'}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Data de Nascimento
                </p>
                <p className="text-base font-bold text-dark-900">{birthDateFormatted}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Celular / WhatsApp
                </p>
                <p className="text-base font-bold text-dark-900">
                  {normalizePhone(volunteer.phone ?? '') || '—'}
                </p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  E-mail
                </p>
                <p className="text-base font-bold text-dark-900 lowercase">
                  {volunteer.email ?? '—'}
                </p>
              </Col>
              {volunteer.profession && (
                <Col xs={24}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                    Profissão
                  </p>
                  <p className="text-base font-bold text-dark-900">{volunteer.profession}</p>
                </Col>
              )}
            </Row>
          </Card>

          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '32px' }}
          >
            <div className="flex items-center gap-2 mb-8">
              <MapPin size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold text-dark-900">Endereço</h2>
            </div>

            {volunteer.address ? (
              <Row gutter={[32, 32]}>
                <Col xs={24} sm={16}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                    Logradouro
                  </p>
                  <p className="text-base font-bold text-dark-900">
                    {volunteer.address.street}, {volunteer.address.number}
                  </p>
                </Col>
                <Col xs={24} sm={8}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                    CEP
                  </p>
                  <p className="text-base font-bold text-dark-900">
                    {normalizeCEP(volunteer.address.cep)}
                  </p>
                </Col>
                <Col xs={24} sm={10}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                    Bairro
                  </p>
                  <p className="text-base font-bold text-dark-900">
                    {volunteer.address.neighborhood}
                  </p>
                </Col>
                <Col xs={24} sm={14}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                    Cidade / Estado
                  </p>
                  <p className="text-base font-bold text-dark-900">
                    {volunteer.address.city} — {volunteer.address.state}
                  </p>
                </Col>
              </Row>
            ) : (
              <p className="text-dark-400 text-sm font-medium">Endereço não cadastrado.</p>
            )}
          </Card>
        </Col>

        {/* Coluna Direita: Perfil de Atuação e Segurança */}
        <Col xs={24} lg={8} className="space-y-6">
          {/* Card de Habilidades */}
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Star size={18} className="text-warning" />
              <h3 className="text-base font-bold text-dark-900">Perfil de Atuação</h3>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">
                  Áreas de Interesse
                </p>
                <div className="flex flex-wrap gap-2">
                  {(volunteer.skills ?? []).length > 0 ? (
                    volunteer.skills.map((skill) => (
                      <Tag
                        key={skill}
                        className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[11px] font-bold px-3 py-1 uppercase tracking-wide m-0"
                      >
                        {skill}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-dark-400 text-sm">Não informado</span>
                  )}
                </div>
              </div>
              <Divider className="my-2" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Turno de Disponibilidade
                </p>
                <p className="text-sm font-bold text-dark-900">
                  {volunteer.availability ?? '—'}
                </p>
              </div>
            </div>
          </Card>

          {/* Card de Emergência */}
          <Card
            className="rounded-2xl shadow-soft border-red-100 bg-red-50/30"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PhoneCall size={18} className="text-red-500" />
              <h3 className="text-base font-bold text-red-600">Contato de Emergência</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-0.5">
                  Nome do Contato
                </p>
                <p className="text-sm font-bold text-dark-900">
                  {volunteer.emergencyName ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-0.5">
                  Telefone
                </p>
                <p className="text-base font-bold text-dark-900">
                  {normalizePhone(volunteer.emergencyPhone ?? '') || '—'}
                </p>
              </div>
            </div>
          </Card>

          {/* Card Jurídico */}
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-900">Documentação Legal</h3>
                {volunteer.acceptedTerms ? (
                  <p className="text-xs text-dark-500 mt-1 leading-relaxed">
                    Termo de Adesão e Autorização de Imagem aceitos digitalmente em{' '}
                    <strong className="text-dark-700">{termsDate}</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    Termos ainda não aceitos.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
