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
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamService, type TeamMember } from '../../services/team.service';

// ============================================================
// HELPERS
// ============================================================

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Col xs={24} sm={12}>
      <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-base font-bold text-dark-900">{value || '—'}</p>
    </Col>
  );
}

// ============================================================
// COMPONENTE
// ============================================================

export default function TeamView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca o membro pelo id da URL
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await teamService.getById(id);
        setMember(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Colaborador não encontrado.' });
        navigate('/people/team');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, navigate]);

  // --------------------------------------------------------
  // Inativar a partir da view
  // --------------------------------------------------------
  const handleInactivate = () => {
    if (!member) return;

    Modal.confirm({
      title: 'Revogar Acesso',
      content: (
        <div>
          Tem certeza que deseja inativar <strong className="text-dark-900">{member.name}</strong>?<br />
          O colaborador perderá o acesso imediato ao sistema.
        </div>
      ),
      centered: true,
      okText: 'Sim, revogar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await teamService.inactivate(member.id);
          setMember((prev) => (prev ? { ...prev, status: 'INACTIVE' } : null));
          notification.success({ message: 'Acesso revogado com sucesso.' });
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar o colaborador.' });
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

  if (!member) return null;

  const isActive = member.status === 'ACTIVE';
  const joinedAt = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header do Perfil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/team')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`}
              className="border-2 border-white shadow-card"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{member.name}</h1>
                <Tag
                  className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-dark-50 text-dark-400 border-dark-200'
                  }`}
                >
                  {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {member.role ?? '—'}
                {member.group && (
                  <>
                    <Divider type="vertical" />
                    <span className="text-secondary-600 uppercase text-xs font-bold tracking-wider">
                      {member.group}
                    </span>
                  </>
                )}
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
              Revogar Acesso
            </Button>
          )}
          <Button
            type="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/people/team/${id}/edit`)}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Editar Perfil
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">

        {/* ── Coluna Lateral: Acesso ── */}
        <Col xs={24} lg={8} className="space-y-6">
          <Card
            className="rounded-2xl shadow-soft border-dark-100 overflow-hidden"
            bodyStyle={{ padding: '24px' }}
          >
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-6">
              Acesso ao Sistema
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Grupo de Acesso</p>
                  <p className="text-sm font-bold text-dark-900">{member.group ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Nível Hierárquico</p>
                  <p className="text-sm font-bold text-dark-900">{member.level ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-500">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">E-mail Corporativo</p>
                  <p className="text-sm font-bold text-dark-900 lowercase">{member.email}</p>
                </div>
              </div>

              {member.phone && (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Celular / WhatsApp</p>
                    <p className="text-sm font-bold text-dark-900">{member.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <Divider className="my-6 border-dark-50" />
            <p className="text-[11px] text-dark-300 text-center font-medium uppercase tracking-tighter">
              Membro desde {joinedAt}
            </p>
          </Card>
        </Col>

        {/* ── Coluna Principal: Dados e Endereço ── */}
        <Col xs={24} lg={16} className="space-y-6">

          {/* Dados Pessoais */}
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '32px' }}
          >
            <div className="flex items-center gap-2 mb-8">
              <IdCard size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-dark-900">Informações Pessoais</h2>
            </div>

            <Row gutter={[32, 32]}>
              <InfoRow label="CPF" value={member.cpf} />
              <InfoRow label="Celular / WhatsApp" value={member.phone} />
              <Col xs={24}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">E-mail Pessoal</p>
                <p className="text-base font-bold text-dark-900 lowercase">{member.personalEmail || '—'}</p>
              </Col>
            </Row>
          </Card>

          {/* Endereço */}
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '32px' }}
          >
            <div className="flex items-center gap-2 mb-8">
              <MapPin size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold text-dark-900">Endereço Residencial</h2>
            </div>

            {member.address ? (
              <Row gutter={[32, 32]}>
                <Col xs={24} sm={16}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Logradouro</p>
                  <p className="text-base font-bold text-dark-900">
                    {member.address.street}, {member.address.number}
                  </p>
                </Col>
                <Col xs={24} sm={8}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">CEP</p>
                  <p className="text-base font-bold text-dark-900">{member.address.cep}</p>
                </Col>
                <InfoRow label="Bairro" value={member.address.neighborhood} />
                <Col xs={24} sm={14}>
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Cidade / Estado</p>
                  <p className="text-base font-bold text-dark-900">
                    {member.address.city} — {member.address.state}
                  </p>
                </Col>
              </Row>
            ) : (
              <p className="text-dark-400 text-sm font-medium">Endereço não cadastrado.</p>
            )}
          </Card>

        </Col>
      </Row>
    </div>
  );
}
