import { useState, useEffect } from 'react';
import { Button, Card, Tag, Row, Col, Avatar, Divider, Skeleton, notification, Modal } from 'antd';
import { ArrowLeft, Edit, MapPin, Mail, Phone, Trash2, HeartHandshake, Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { networkService, type NetworkPerson } from '../../services/network.service';
import { normalizeCEP, normalizePhone } from '../../../../utils/masks';

function formatDocument(doc: string | null) {
  if (!doc) return '—';
  const d = doc.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
}

const roleTag: Record<string, { text: string; className: string }> = {
  DONOR: { text: 'Doador', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  PARTNER: { text: 'Parceiro/Fornecedor', className: 'bg-secondary-50 text-secondary-600 border-secondary-200' },
  VOLUNTEER: { text: 'Voluntário', className: 'bg-green-50 text-green-600 border-green-200' },
};

export default function NetworkView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [person, setPerson] = useState<NetworkPerson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setPerson(await networkService.getById(id));
      } catch {
        notification.error({ message: 'Erro', description: 'Registro não encontrado.' });
        navigate('/people/network');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleInactivate = () => {
    if (!person) return;
    Modal.confirm({
      title: 'Inativar registro',
      content: <div>Tem certeza que deseja inativar <strong className="text-dark-900">{person.name}</strong>?</div>,
      centered: true,
      okText: 'Sim, inativar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await networkService.inactivate(person.id);
          setPerson((prev) => (prev ? { ...prev, status: 'INACTIVE' } : null));
          notification.success({ message: 'Registro inativado com sucesso.' });
        } catch {
          notification.error({ message: 'Erro', description: 'Não foi possível inativar.' });
        }
      },
    });
  };

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
        <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </div>
    );
  }

  if (!person) return null;

  const isActive = person.status === 'ACTIVE';
  const memberSince = person.createdAt ? new Date(person.createdAt).toLocaleDateString('pt-BR') : '—';
  const typeLabel = person.kind === 'INDIVIDUAL' ? 'Pessoa Física' : 'Pessoa Jurídica';
  const hasAddress = person.street || person.city;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-6">
          <Button
            type="text" icon={<ArrowLeft size={20} />}
            onClick={() => navigate('/people/network')}
            className="text-dark-400 hover:text-dark-900 bg-white shadow-sm border border-dark-100 rounded-xl h-10 w-10 flex items-center justify-center"
          />
          <div className="flex items-center gap-5">
            <Avatar
              size={80}
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(person.name)}&backgroundColor=009082`}
              className="border-2 border-white shadow-card font-bold text-2xl"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{person.name}</h1>
                <Tag className={`font-bold px-3 py-0.5 rounded-full uppercase text-[10px] border ${isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-dark-50 text-dark-400 border-dark-200'}`}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {person.roles.map((r) => {
                  const cfg = roleTag[r];
                  if (!cfg) return null;
                  return <Tag key={r} className={`rounded-full font-bold text-[10px] px-2 border m-0 ${cfg.className}`}>{cfg.text}</Tag>;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isActive && (
            <Button icon={<Trash2 size={18} />} onClick={handleInactivate} className="border-red-200 text-red-500 hover:!text-red-600 hover:!border-red-400 rounded-xl font-bold px-5 h-11 flex items-center">
              Inativar
            </Button>
          )}
          <Button icon={<Edit size={18} />} onClick={() => navigate(`/people/network/${id}/edit`)} className="border-dark-100 text-dark-600 hover:text-dark-900 rounded-xl font-bold px-6 h-11 flex items-center">
            Editar Perfil
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-base font-bold text-dark-900 mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" /> Contato & Identificação
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Tipo</p>
                <p className="text-sm font-bold text-dark-900">{typeLabel}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">{person.kind === 'INDIVIDUAL' ? 'CPF' : 'CNPJ'}</p>
                <p className="text-sm font-bold text-dark-900">{formatDocument(person.document)}</p>
              </div>
              {person.email && (
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">E-mail</p>
                    <p className="text-sm font-bold text-dark-900 lowercase">{person.email}</p>
                  </div>
                </div>
              )}
              {person.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-dark-300 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-dark-400 uppercase">Telefone</p>
                    <p className="text-sm font-bold text-dark-900">{normalizePhone(person.phone)}</p>
                  </div>
                </div>
              )}
              {hasAddress && (
                <>
                  <Divider className="my-4 border-dark-50" />
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-dark-300 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-dark-400 uppercase mb-1">Endereço</p>
                      <p className="text-sm font-bold text-dark-900 leading-snug">
                        {person.street}, {person.number}<br />
                        {person.neighborhood} — {person.city}/{person.state}<br />
                        {person.zipCode ? normalizeCEP(person.zipCode) : ''}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <Divider className="my-4 border-dark-50" />
              <div>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">No sistema desde</p>
                <p className="text-sm font-bold text-dark-900">{memberSince}</p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <div className="space-y-6">
            {person.roles.includes('DONOR') && (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                <h3 className="text-lg font-bold text-dark-900 mb-6 flex items-center gap-2">
                  <HeartHandshake size={20} className="text-primary-500" /> Perfil de Doação
                </h3>
                <Row gutter={[32, 32]}>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Recorrência Principal</p>
                    <p className="text-base font-bold text-dark-900">{person.donationRecurrence ?? '—'}</p>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Método de Pagamento</p>
                    <p className="text-base font-bold text-dark-900">{person.preferredPayment ?? '—'}</p>
                  </Col>
                </Row>
              </Card>
            )}

            {person.roles.includes('PARTNER') && (
              <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
                <h3 className="text-lg font-bold text-dark-900 mb-6 flex items-center gap-2">
                  <Building2 size={20} className="text-secondary-500" /> Perfil de Parceria
                </h3>
                <Row gutter={[32, 32]}>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Tipo</p>
                    <p className="text-base font-bold text-dark-900">{person.partnershipType ?? '—'}</p>
                  </Col>
                  <Col xs={24} sm={12}>
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Contato</p>
                    <p className="text-base font-bold text-dark-900">{person.contactName ?? '—'}</p>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
