import { Button, Card, Tag, Row, Col, Avatar, Divider } from 'antd';
import { 
  ArrowLeft, 
  Edit, 
  Mail,  
  MapPin, 
  ShieldCheck, 
  User, 
  IdCard,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TeamView() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock de dados completo para a visualização
  const member = {
    id,
    name: 'Timóteo Silva',
    email: 'timoteo@iires.org.br',
    personal_email: 'timoteo.dev@gmail.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    role: 'Diretor Técnico',
    level: 'Diretor',
    group: 'Tecnologia',
    status: 'active',
    address: 'Avenida Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    cep: '01310-100',
    joinedAt: '15/01/2024'
  };

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
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} 
              className="border-2 border-white shadow-card"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-dark-900 tracking-tight">{member.name}</h1>
                <Tag className="bg-green-50 text-green-600 border-green-200 font-bold px-3 py-0.5 rounded-full uppercase text-[10px]">
                  Ativo
                </Tag>
              </div>
              <p className="text-dark-400 font-medium flex items-center gap-2 mt-1">
                {member.role} <Divider type="vertical" /> <span className="text-secondary-600 uppercase text-xs font-bold tracking-wider">{member.group}</span>
              </p>
            </div>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<Edit size={18} />} 
          onClick={() => navigate(`/people/team/${id}/edit`)}
          className="bg-dark-900 hover:!bg-dark-800 border-none rounded-xl font-bold shadow-soft px-6 h-11 flex items-center"
        >
          Editar Perfil
        </Button>
      </div>

      <Row gutter={[24, 24]} className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
        {/* Coluna Lateral: Infos de Acesso */}
        <Col xs={24} lg={8} className="space-y-6">
          <Card className="rounded-2xl shadow-soft border-dark-100 overflow-hidden" bodyStyle={{ padding: '24px' }}>
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-6">Acesso ao Sistema</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Grupo de Acesso</p>
                  <p className="text-sm font-bold text-dark-900">{member.group}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-bold uppercase tracking-wide">Nível Hierárquico</p>
                  <p className="text-sm font-bold text-dark-900">{member.level}</p>
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
            </div>

            <Divider className="my-6 border-dark-50" />
            <p className="text-[11px] text-dark-300 text-center font-medium uppercase tracking-tighter">Membro desde {member.joinedAt}</p>
          </Card>
        </Col>

        {/* Coluna Principal: Detalhes */}
        <Col xs={24} lg={16} className="space-y-6">
          
          {/* Card: Dados Pessoais */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-8">
              <IdCard size={20} className="text-primary-500" />
              <h2 className="text-lg font-bold text-dark-900">Informações Pessoais</h2>
            </div>
            
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">CPF</p>
                <p className="text-base font-bold text-dark-900">{member.cpf}</p>
              </Col>
              <Col xs={24} sm={12}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Celular / WhatsApp</p>
                <p className="text-base font-bold text-dark-900">{member.phone}</p>
              </Col>
              <Col xs={24}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">E-mail Pessoal</p>
                <p className="text-base font-bold text-dark-900 lowercase">{member.personal_email}</p>
              </Col>
            </Row>
          </Card>

          {/* Card: Localização */}
          <Card className="rounded-2xl shadow-soft border-dark-100" bodyStyle={{ padding: '32px' }}>
            <div className="flex items-center gap-2 mb-8">
              <MapPin size={20} className="text-secondary-500" />
              <h2 className="text-lg font-bold text-dark-900">Endereço Residencial</h2>
            </div>

            <Row gutter={[32, 32]}>
              <Col xs={24} sm={16}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Logradouro</p>
                <p className="text-base font-bold text-dark-900">{member.address}, {member.number}</p>
              </Col>
              <Col xs={24} sm={8}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">CEP</p>
                <p className="text-base font-bold text-dark-900">{member.cep}</p>
              </Col>
              <Col xs={24} sm={10}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Bairro</p>
                <p className="text-base font-bold text-dark-900">{member.neighborhood}</p>
              </Col>
              <Col xs={24} sm={14}>
                <p className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-1">Cidade / Estado</p>
                <p className="text-base font-bold text-dark-900">{member.city} — {member.state}</p>
              </Col>
            </Row>
          </Card>

        </Col>
      </Row>
    </div>
  );
}