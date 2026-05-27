import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Modal } from 'antd';
import {
  ArrowLeft,
  Edit,
  MapPin,
  TrendingUp,
  DollarSign,
  Mail,
  Phone,
  FileText,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { donorsService, type Donor } from '../../services/donors.service';
import { normalizeCEP, normalizePhone } from '../../../../utils/masks';

// ============================================================
// HELPERS
// ============================================================

function formatDocument(doc: string) {
  if (!doc) return '—';
  const d = doc.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
}

export default function DonorsView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Busca o doador pelo id
  // --------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchDonor = async () => {
      try {
        setLoading(true);
        const data = await donorsService.getById(id);
        setDonor(data);
      } catch {
        notification.error({ message: 'Erro', description: 'Doador não encontrado.' });
        navigate('/people/donors');
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, [id, navigate]);

  // --------------------------------------------------------
  // Inativar a partir da view
  // --------------------------------------------------------
  const handleInactivate = () => {
    if (!donor) return;

    Modal.confirm({
      title: 'Inativar Doador',
      content: (
        <div>
          Tem certeza que deseja inativar{' '}
          <strong className="text-dark-900">{donor.name}</strong>?<br />
          O histórico financeiro de doações passadas será mantido.
        </div>
      ),
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await donorsService.inactivate(donor.id);
          setDonor((prev) => (prev ? { ...prev, status: 'inactive' } : null));
          notification.success({ message: 'Doador inativado com sucesso.' });
        } catch {
          notification.error({
            message: 'Erro',
            description: 'Não foi possível inativar o doador.',
          });
        }
      },
    });
  };

  // --------------------------------------------------------
  // Atalho para lançar nova doação
  // --------------------------------------------------------
  const handleNewDonation = () => {
    navigate('/finance/receivables/new', {
      state: {
        payer: donor?.name,
        categoryId: 'donation',
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
          <Col xs={24} sm={8}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '20px' }}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '0' }}>
              <Skeleton active paragraph={{ rows: 5 }} className="p-6" />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!donor) return null;

  const isActive = donor.status === 'active';
  const memberSince = donor.createdAt
    ? new Date(donor.createdAt).toLocaleDateString('pt-BR')
    : '—';
  const typeLabel = donor.type === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/donors')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center transition-all"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(donor.name)}&backgroundColor=0047AF`}
              className="border-2 border-white shadow-card font-bold text-2xl"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{donor.name}</h1>
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
                {typeLabel}{' '}
                <Divider type="vertical" />{' '}
                <span className="text-secondary-600 font-bold text-xs uppercase tracking-wider">
                  {donor.recurrence ?? '—'}
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
              <Button
                type="primary"
                icon={<DollarSign size={18} />}
                onClick={handleNewDonation}
                className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
              >
                Lançar Doação
              </Button>
            </>
          )}
          <Button
            icon={<Edit size={18} />}
            onClick={() => navigate(`/people/donors/${id}/edit`)}
            className="border-dark-100 text-dark-600 hover:text-dark-900 rounded-xl font-bold px-6 h-11 flex items-center"
          >
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <Row
        gutter={[24, 24]}
        className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-75"
      >
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full p-1"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Recorrência
                </p>
                <h3 className="text-xl font-bold text-primary-600 leading-tight">
                  {donor.recurrence ?? '—'}
                </h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Frequência de doação</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full p-1"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Método de Pagamento
                </p>
                <h3 className="text-xl font-bold text-dark-900 leading-tight">
                  {donor.paymentMethod ?? '—'}
                </h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Preferência atual</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-secondary-50 text-secondary-600">
                <FileText size={24} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full p-1"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Doador desde
                </p>
                <h3 className="text-xl font-bold text-dark-900 leading-tight">{memberSince}</h3>
                <p className="text-dark-400 text-xs mt-1 font-medium">Data de cadastro</p>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-dark-50 text-dark-600">
                <TrendingUp size={24} />
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
        {/* Coluna Lateral: Dados de Contato */}
        <Col xs={24} lg={8}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100"
            bodyStyle={{ padding: '24px' }}
          >
            <h3 className="text-base font-bold text-dark-900 mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" /> Contato & Identificação
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Tipo
                </p>
                <p className="text-sm font-bold text-dark-900">{typeLabel}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  {donor.type === 'PF' ? 'CPF' : 'CNPJ'}
                </p>
                <p className="text-sm font-bold text-dark-900">
                  {formatDocument(donor.document)}
                </p>
              </div>
              {donor.email && (
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">E-mail</p>
                    <p className="text-sm font-bold text-dark-900 lowercase">{donor.email}</p>
                  </div>
                </div>
              )}
              {donor.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">Telefone</p>
                    <p className="text-sm font-bold text-dark-900">
                      {normalizePhone(donor.phone)}
                    </p>
                  </div>
                </div>
              )}

              {donor.address && (
                <>
                  <Divider className="my-4 border-dark-50" />
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-dark-300 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-dark-400 uppercase mb-1">Endereço</p>
                      <p className="text-sm font-bold text-dark-900 leading-snug">
                        {donor.address.street}, {donor.address.number}
                        <br />
                        {donor.address.neighborhood} — {donor.address.city}/{donor.address.state}
                        <br />
                        {normalizeCEP(donor.address.cep)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Coluna Principal: Informações e Ações */}
        <Col xs={24} lg={16}>
          <Card
            className="rounded-2xl shadow-soft border-dark-100 h-full"
            bodyStyle={{ padding: '32px' }}
          >
            <h3 className="text-lg font-bold text-dark-900 mb-6">Perfil de Doação</h3>

            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Recorrência Principal
                </p>
                <p className="text-base font-bold text-dark-900">{donor.recurrence ?? '—'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Método de Pagamento
                </p>
                <p className="text-base font-bold text-dark-900">{donor.paymentMethod ?? '—'}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">
                  Status do Cadastro
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
                  Data de Cadastro
                </p>
                <p className="text-base font-bold text-dark-900">{memberSince}</p>
              </Col>
            </Row>

            <Divider className="my-8" />

            <div className="bg-primary-50 rounded-2xl p-6">
              <p className="text-sm font-bold text-primary-700 mb-2">
                Lançar nova doação para este doador
              </p>
              <p className="text-xs text-primary-600 mb-4">
                Ao clicar, você será redirecionado ao módulo financeiro com o doador
                pré-selecionado.
              </p>
              <Button
                type="primary"
                icon={<DollarSign size={16} />}
                onClick={handleNewDonation}
                className="bg-primary-500 hover:!bg-primary-600 border-none rounded-xl font-bold"
              >
                Lançar Doação
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
