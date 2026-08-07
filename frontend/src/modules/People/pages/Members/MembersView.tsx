import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Modal } from 'antd';
import {
  ArrowLeft,
  Edit,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  IdCard,
  Phone,
  Trash2,
  Star,
  PhoneCall,
  Clock,
  Briefcase,
  CalendarDays,
  FileText,
  Heart,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService, type TeamMember } from '../../services/team.service';
import { volunteersService, type Volunteer } from '../../services/volunteers.service';
import { normalizeCPF, normalizePhone, normalizeCEP } from '../../../../utils/masks';

// ─── Helpers ────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Col xs={24} sm={12}>
      <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-base font-bold text-dark-900">{value || '—'}</p>
    </Col>
  );
}

const BOND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CLT:        { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  Prestador:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  Voluntário: { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200' },
};

// ─── Componente ─────────────────────────────────────────────

export default function MembersView() {
  const navigate = useNavigate();
  const { kind, id } = useParams<{ kind: string; id: string }>();

  const isVolunteer = kind === 'volunteer';

  const [member, setMember]     = useState<TeamMember | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!id || !kind) return;

    const fetch = async () => {
      try {
        setLoading(true);
        if (kind === 'volunteer') {
          setVolunteer(await volunteersService.getById(id));
        } else {
          setMember(await teamService.getById(id));
        }
      } catch {
        notification.error({ message: 'Erro', description: 'Colaborador não encontrado.' });
        navigate('/people/members');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id, kind, navigate]);

  const handleInactivate = () => {
    const name = isVolunteer ? volunteer?.name : member?.name;
    if (!name) return;

    Modal.confirm({
      title: 'Inativar Colaborador',
      content: (
        <div>
          Tem certeza que deseja inativar <strong className="text-dark-900">{name}</strong>?
          {!isVolunteer && <><br />O acesso ao sistema será revogado imediatamente.</>}
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          if (isVolunteer && volunteer) {
            await volunteersService.inactivate(volunteer.id);
            setVolunteer((prev) => (prev ? { ...prev, status: 'INACTIVE' } : null));
          } else if (member) {
            await teamService.inactivate(member.id);
            setMember((prev) => (prev ? { ...prev, status: 'INACTIVE' } : null));
          }
          notification.success({ message: 'Colaborador inativado com sucesso.' });
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar.' });
        }
      },
    });
  };

  const handleDownloadTermo = async () => {
    if (!volunteer) return;
    try {
      await volunteersService.downloadTermo(volunteer.id, volunteer.name);
    } catch {
      notification.error({ message: 'Erro', description: 'Não foi possível gerar o termo.' });
    }
  };

  // ── Loading skeleton ────────────────────────────────────────
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
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
          <Col xs={24} lg={16} className="space-y-6">
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // ── Unified data ────────────────────────────────────────────
  const data = isVolunteer ? volunteer : member;
  if (!data) return null;

  const isActive   = data.status === 'ACTIVE';
  const joinedAt   = data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : '—';
  const bondType   = isVolunteer ? 'Voluntário' : (member?.bondType ?? 'CLT');
  const bondStyle  = BOND_COLORS[bondType] ?? { bg: 'bg-dark-50', text: 'text-dark-600', border: 'border-dark-200' };
  const avatarBg   = isVolunteer ? '026B11' : '0047AF';

  const vol = volunteer!;
  const mem = member!;

  const birthDateFormatted = isVolunteer && vol.birthDate
    ? new Date(vol.birthDate).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/members')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=${avatarBg}`}
              className="border-2 border-white shadow-card"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{data.name}</h1>
                <Tag className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${bondStyle.bg} ${bondStyle.text} ${bondStyle.border}`}>
                  {bondType}
                </Tag>
                <Tag className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-dark-50 text-dark-400 border-dark-200'}`}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {isVolunteer
                  ? (vol.profession ?? 'Voluntário')
                  : (mem.role ?? '—')}
                {!isVolunteer && mem.group && (
                  <>
                    <Divider type="vertical" />
                    <span className="text-secondary-600 uppercase text-xs font-bold tracking-wider">{mem.group}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {isVolunteer && isActive && (
            <Button
              icon={<FileText size={18} />}
              onClick={handleDownloadTermo}
              className="border-secondary-200 text-secondary-600 hover:!text-secondary-700 hover:!border-secondary-400 rounded-xl font-bold px-5 h-11 flex items-center"
            >
              Baixar Termo
            </Button>
          )}
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
            onClick={() => navigate(`/people/members/${kind}/${id}/edit`)}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* ── Métricas (voluntário) ── */}
      {isVolunteer && (
        <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75">
          {[
            { title: 'Horas Doadas', value: `${vol.hoursDonated}h`, sub: 'Impacto total',    icon: <Clock size={24} className="text-primary-600" />,    bg: 'bg-primary-50' },
            { title: 'Projetos Ativos', value: vol.activeProjects,  sub: 'Em andamento',     icon: <Briefcase size={24} className="text-secondary-600" />, bg: 'bg-secondary-50' },
            { title: 'Desde', value: joinedAt,                       sub: 'Data de adesão',   icon: <CalendarDays size={24} className="text-dark-600" />,   bg: 'bg-dark-50' },
          ].map((stat, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <Card className="rounded-2xl shadow-soft border-dark-100 h-full p-1" bodyStyle={{ padding: '20px' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-dark-900 leading-tight">{stat.value}</h3>
                    <p className="text-dark-400 text-xs mt-1 font-medium">{stat.sub}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>{stat.icon}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Conteúdo principal ── */}
      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">

        {/* Coluna principal */}
        <Col xs={24} lg={16} className="space-y-6">
          {/* Dados Pessoais */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-8">
              <IdCard size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-dark-900">Informações Pessoais</h2>
            </div>
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">CPF</p>
                <p className="text-base font-bold text-dark-900">{normalizeCPF(data.cpf ?? '') || '—'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Celular / WhatsApp</p>
                <p className="text-base font-bold text-dark-900">{normalizePhone(data.phone ?? '') || '—'}</p>
              </Col>

              {isVolunteer ? (
                <>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Data de Nascimento</p>
                    <p className="text-base font-bold text-dark-900">{birthDateFormatted}</p>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">E-mail</p>
                    <p className="text-base font-bold text-dark-900 lowercase">{vol.email ?? '—'}</p>
                  </Col>
                  {vol.rg && <InfoRow label="RG" value={vol.rg} />}
                  {vol.nationality && <InfoRow label="Nacionalidade" value={vol.nationality} />}
                  {vol.maritalStatus && <InfoRow label="Estado Civil" value={vol.maritalStatus} />}
                  {vol.profession && (
                    <Col xs={24}>
                      <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Profissão</p>
                      <p className="text-base font-bold text-dark-900">{vol.profession}</p>
                    </Col>
                  )}
                  {vol.supervisor && (
                    <Col xs={24}>
                      <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Supervisor</p>
                      <p className="text-base font-bold text-dark-900">{vol.supervisor.name}</p>
                    </Col>
                  )}
                </>
              ) : (
                <>
                  <Col xs={24}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">E-mail Pessoal</p>
                    <p className="text-base font-bold text-dark-900 lowercase">{mem.personalEmail || '—'}</p>
                  </Col>
                </>
              )}
            </Row>
          </Card>

          {/* Atividades (voluntário) */}
          {isVolunteer && (vol.services || vol.schedule) && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <div className="flex items-center gap-2 mb-8">
                <Briefcase size={20} className="text-secondary-500" />
                <h2 className="text-lg font-bold text-dark-900">Atividades & Horários</h2>
              </div>
              <Row gutter={[32, 32]}>
                {vol.services && (
                  <Col xs={24}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Serviços / Atividades</p>
                    <p className="text-base font-bold text-dark-900 whitespace-pre-line">{vol.services}</p>
                  </Col>
                )}
                {vol.schedule && (
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Horário de Atividade</p>
                    <p className="text-base font-bold text-dark-900">{vol.schedule}</p>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Endereço */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-8">
              <MapPin size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold text-dark-900">Endereço Residencial</h2>
            </div>
            {data.address ? (
              <Row gutter={[32, 32]}>
                <Col xs={24} sm={16}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Logradouro</p>
                  <p className="text-base font-bold text-dark-900">{data.address.street}, {data.address.number}</p>
                </Col>
                <Col xs={24} sm={8}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">CEP</p>
                  <p className="text-base font-bold text-dark-900">{normalizeCEP(data.address.cep)}</p>
                </Col>
                <InfoRow label="Bairro" value={data.address.neighborhood} />
                <Col xs={24} sm={14}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Cidade / Estado</p>
                  <p className="text-base font-bold text-dark-900">{data.address.city} — {data.address.state}</p>
                </Col>
              </Row>
            ) : (
              <p className="text-dark-400 text-sm font-medium">Endereço não cadastrado.</p>
            )}
          </Card>
        </Col>

        {/* Coluna lateral */}
        <Col xs={24} lg={8} className="space-y-6">

          {/* Acesso ao sistema (usuário) */}
          {!isVolunteer && (
            <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: '24px' }}>
              <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-6">Acesso ao Sistema</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-600"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Grupo de Acesso</p>
                    <p className="text-sm font-bold text-dark-900">{mem.group ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><User size={20} /></div>
                  <div>
                    <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Nível Hierárquico</p>
                    <p className="text-sm font-bold text-dark-900">{mem.level ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-500"><Mail size={20} /></div>
                  <div>
                    <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">E-mail Corporativo</p>
                    <p className="text-sm font-bold text-dark-900 lowercase">{mem.email}</p>
                  </div>
                </div>
                {mem.phone && (
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><Phone size={20} /></div>
                    <div>
                      <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Celular / WhatsApp</p>
                      <p className="text-sm font-bold text-dark-900">{mem.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              <Divider className="my-6 border-dark-50" />
              <p className="text-[11px] text-dark-300 text-center font-medium uppercase tracking-tighter">Membro desde {joinedAt}</p>
            </Card>
          )}

          {/* Perfil de Atuação (voluntário) */}
          {isVolunteer && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-2 mb-6">
                <Star size={18} className="text-warning" />
                <h3 className="text-base font-bold text-dark-900">Perfil de Atuação</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Áreas de Interesse</p>
                  <div className="flex flex-wrap gap-2">
                    {(vol.skills ?? []).length > 0 ? (
                      vol.skills.map((skill) => (
                        <Tag key={skill} className="rounded-md bg-dark-50 text-dark-600 border border-dark-100 text-[11px] font-bold px-3 py-1 uppercase tracking-wide m-0">
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
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Turno de Disponibilidade</p>
                  <p className="text-sm font-bold text-dark-900">{vol.availability ?? '—'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Contato de Emergência (voluntário) */}
          {isVolunteer && (
            <Card className="rounded-2xl shadow-soft border-red-100 bg-red-50/30" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-2 mb-4">
                <PhoneCall size={18} className="text-red-500" />
                <h3 className="text-base font-bold text-red-600">Contato de Emergência</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Nome do Contato</p>
                  <p className="text-sm font-bold text-dark-900">{vol.emergencyName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Telefone</p>
                  <p className="text-base font-bold text-dark-900">{normalizePhone(vol.emergencyPhone ?? '') || '—'}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Documentação Legal (voluntário) */}
          {isVolunteer && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark-900">Documentação Legal</h3>
                  {vol.acceptedTerms ? (
                    <p className="text-xs text-dark-500 mt-1 leading-relaxed">
                      Termo de Adesão aceito digitalmente em{' '}
                      <strong className="text-dark-700">
                        {vol.createdAt ? new Date(vol.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </strong>.
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 mt-1 font-medium">Termos ainda não aceitos.</p>
                  )}
                </div>
              </div>
              {vol.acceptedTerms && (
                <Button
                  icon={<FileText size={16} />}
                  onClick={handleDownloadTermo}
                  className="mt-4 w-full rounded-xl border-secondary-200 text-secondary-600 hover:!text-secondary-700 hover:!border-secondary-400 font-bold flex items-center justify-center"
                >
                  Baixar Termo de Adesão
                </Button>
              )}
            </Card>
          )}

          {/* Vínculo (voluntário sidebar info) */}
          {isVolunteer && (
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <Heart size={20} className="fill-green-100" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Vínculo</p>
                  <p className="text-sm font-bold text-dark-900">Voluntário</p>
                </div>
              </div>
              <Divider className="my-4 border-dark-50" />
              <p className="text-[11px] text-dark-300 text-center font-medium uppercase tracking-tighter">Membro desde {joinedAt}</p>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
