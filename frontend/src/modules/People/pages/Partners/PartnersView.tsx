import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Modal } from 'antd';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  User,
  DollarSign,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { partnersService, type Partner } from '../../services/partners.service';
import { normalizeCEP, normalizePhone } from '../../../../utils/masks';

// ============================================================
// HELPER
// ============================================================

function formatCnpj(raw: string) {
  const d = (raw ?? '').replace(/\D/g, '');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return raw;
}

export default function PartnersView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca o parceiro pelo id
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchPartner = async () => {
      try {
        setLoading(true);
        const data = await partnersService.getById(id);
        setPartner(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Registro não encontrado.' });
        navigate('/people/partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id, navigate]);

  // --------------------------------------------------------
  // Inativar a partir da view
  // --------------------------------------------------------
  const handleInactivate = () => {
    if (!partner) return;

    Modal.confirm({
      title: 'Inativar Registro',
      content: (
        <div>
          Tem certeza que deseja inativar{' '}
          <strong className="text-dark-900">{partner.name}</strong>?<br />
          O histórico de contas a pagar e vínculos com projetos será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await partnersService.inactivate(partner.id);
          setPartner((prev) => (prev ? { ...prev, status: 'inactive' } : null));
          notification.success({ message: 'Registro inativado com sucesso.' });
        } catch {
          notification.error({
            message: 'Erro',
            description: 'Não foi possível inativar o registro.',
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
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: 220 }} />
          </div>
        </div>
        <Row gutter={[24, 24]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Card
                className="rounded-2xl shadow-soft border-dark-100"
                bodyStyle={{ padding: '24px' }}
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!partner) return null;

  const isActive = partner.status === 'active';
  const isFornecedor = partner.partnershipType === 'Fornecedor';
  const memberSince = partner.createdAt
    ? new Date(partner.createdAt).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header do Perfil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/partners')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              icon={isFornecedor ? <Building2 size={40} /> : <Briefcase size={40} />}
              className={`${
                isFornecedor
                  ? 'bg-secondary-50 text-secondary-600'
                  : 'bg-primary-50 text-primary-600'
              } border-2 border-white shadow-card`}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">
                  {partner.name}
                </h1>
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
                {formatCnpj(partner.cnpj)}{' '}
                <Divider type="vertical" />{' '}
                <span className="text-dark-600 font-bold uppercase text-xs tracking-wider">
                  {partner.partnershipType}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isActive && (
            <>
              <Button
                icon={<Trash2 size={18} />}
                onClick={handleInactivate}
                className="border-red-200 text-red-500 hover:!text-red-600 hover:!border-red-400 rounded-xl font-bold px-5 h-11 flex items-center"
              >
                Inativar
              </Button>
              {isFornecedor && (
                <Button
                  icon={<DollarSign size={18} />}
                  className="bg-white text-dark-700 border-dark-200 hover:border-primary-500 hover:text-primary-600 rounded-xl font-bold shadow-soft h-11 px-5 flex items-center"
                  onClick={() =>
                    navigate('/finance/payables/new', {
                      state: { provider: partner.name },
                    })
                  }
                >
                  Lançar Despesa
                </Button>
              )}
            </>
          )}
          <Button
            type="primary"
            icon={<Edit size={18} />}
            onClick={() => navigate(`/people/partners/${id}/edit`)}
            className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
          >
            Editar Registro
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <Row
        gutter={[24, 24]}
        className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
      >
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: '24px' }}
          >
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
              Tipo de Vínculo
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-bold text-dark-900">{partner.partnershipType}</h3>
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  isFornecedor ? 'bg-secondary-50 text-secondary-600' : 'bg-primary-50 text-primary-600'
                }`}
              >
                {isFornecedor ? <Building2 size={20} /> : <Briefcase size={20} />}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: '24px' }}
          >
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
              Responsável
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-bold text-dark-900">
                {partner.contactName ?? '—'}
              </h3>
              <div className="h-10 w-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-600">
                <User size={20} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: '24px' }}
          >
            <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
              Parceiro desde
            </p>
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-bold text-dark-900">{memberSince}</h3>
              <div className="h-10 w-10 rounded-xl bg-dark-50 flex items-center justify-center text-dark-600">
                <Calendar size={20} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Grid Principal */}
      <Row
        gutter={[24, 24]}
        className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150"
      >
        {/* Coluna Lateral: Dados e Contato */}
        <Col xs={24} lg={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '24px' }}
          >
            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest mb-6">
              Dados Institucionais
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <User size={18} className="text-dark-300 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-dark-400 uppercase">Responsável</p>
                  <p className="text-sm font-bold text-dark-900">
                    {partner.contactName ?? '—'}
                  </p>
                </div>
              </div>
              {partner.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">E-mail</p>
                    <p className="text-sm font-bold text-dark-900 lowercase">{partner.email}</p>
                  </div>
                </div>
              )}
              {partner.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">Telefone</p>
                    <p className="text-sm font-bold text-dark-900">
                      {normalizePhone(partner.phone)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {partner.address && (
              <>
                <Divider className="my-6 border-dark-50" />
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">Localização</p>
                    <p className="text-sm font-bold text-dark-900 leading-snug">
                      {partner.address.street}, {partner.address.number}
                      <br />
                      {partner.address.neighborhood} — {partner.address.city}/
                      {partner.address.state}
                      <br />
                      {normalizeCEP(partner.address.cep)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Coluna Principal: Detalhes */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: '32px' }}
          >
            <h3 className="text-lg font-bold text-dark-900 mb-8">Dados do Registro</h3>

            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  CNPJ / Documento
                </p>
                <p className="text-base font-bold text-dark-900">{formatCnpj(partner.cnpj)}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Tipo de Parceria
                </p>
                <p className="text-base font-bold text-dark-900">{partner.partnershipType}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Status
                </p>
                <Tag
                  className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${
                    isActive
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-dark-50 text-dark-400 border-dark-200'
                  }`}
                >
                  {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Cadastrado em
                </p>
                <p className="text-base font-bold text-dark-900">{memberSince}</p>
              </Col>
            </Row>

            {isFornecedor && isActive && (
              <>
                <Divider className="my-8" />
                <div className="bg-secondary-50 rounded-2xl p-6">
                  <p className="text-sm font-bold text-secondary-700 mb-2">
                    Lançar despesa para este fornecedor
                  </p>
                  <p className="text-xs text-secondary-600 mb-4">
                    Ao clicar, você será redirecionado ao módulo financeiro com o fornecedor
                    pré-selecionado.
                  </p>
                  <Button
                    icon={<DollarSign size={16} />}
                    className="bg-secondary-500 hover:!bg-secondary-600 text-white border-none rounded-xl font-bold"
                    onClick={() =>
                      navigate('/finance/payables/new', {
                        state: { provider: partner.name },
                      })
                    }
                  >
                    Lançar Despesa
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
