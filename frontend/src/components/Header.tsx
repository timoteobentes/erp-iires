import React from 'react';
import { Button, Input, Badge, Avatar, Dropdown, Divider, List } from 'antd';
import { 
  Search, 
  Bell, 
  Menu as MenuIcon, 
  AlignLeft, 
  User, 
  Settings, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  collapsed: boolean;
  onMenuClick: () => void;
}

// Mock de Notificações seguindo o padrão da imagem
const notifications = [
  {
    id: '1',
    title: 'Novo Projeto Criado',
    description: 'O projeto "Inovação Verde" foi registrado com sucesso.',
    time: '5 min atrás',
    type: 'success',
    icon: <CheckCircle2 size={16} className="text-primary-600" />,
    bg: 'bg-primary-50',
  },
  {
    id: '2',
    title: 'Aviso de Orçamento',
    description: 'O orçamento do projeto "Água Limpa" atingiu 80%.',
    time: '2 horas atrás',
    type: 'warning',
    icon: <AlertCircle size={16} className="text-warning" />,
    bg: 'bg-yellow-50',
  },
  {
    id: '3',
    title: 'Novo Voluntário',
    description: 'Marcos Silva se candidatou para o projeto "Horta Comunitária".',
    time: '5 horas atrás',
    type: 'info',
    icon: <Info size={16} className="text-secondary-600" />,
    bg: 'bg-secondary-50',
  },
];

const Header: React.FC<HeaderProps> = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();

  // Itens do Menu do Usuário (já criados anteriormente)
  const userMenuItems = [
    { key: 'profile', label: 'Meu Perfil', icon: <User size={16} />, onClick: () => navigate('/profile') },
    { key: 'settings', label: 'Configurações', icon: <Settings size={16} />, onClick: () => navigate('/settings') },
    { type: 'divider' as const },
    { key: 'logout', label: 'Sair do Sistema', icon: <LogOut size={16} />, danger: true },
  ];

  return (
    <header className="h-20 bg-white border-b border-dark-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <Button 
          type="text" 
          icon={collapsed ? <MenuIcon size={22} className="text-dark-600" /> : <AlignLeft size={22} className="text-dark-600" />} 
          onClick={onMenuClick}
          className="hover:bg-background flex items-center justify-center rounded-lg h-10 w-10 transition-colors"
        />
        
        <div className="hidden sm:flex items-center bg-background rounded-xl px-3 py-1 border border-transparent focus-within:border-secondary-300 transition-all">
          <Search size={18} className="text-dark-300" />
          <Input 
            placeholder="Buscar no ERP..." 
            variant="borderless" 
            className="w-64 placeholder:text-dark-300 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* DROPDOWN DE NOTIFICAÇÕES */}
        <Dropdown
          trigger={['hover']}
          placement="bottomRight"
          overlayClassName="min-w-[380px]"
          dropdownRender={() => (
            <div className="bg-white rounded-2xl shadow-card border border-dark-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 flex justify-between items-center bg-white border-b border-dark-50">
                <h3 className="text-base font-bold text-dark-900">Notificações</h3>
                <span className="text-xs font-medium text-primary-600 cursor-pointer hover:underline">Marcar todas como lidas</span>
              </div>
              
              <div className="max-h-[400px] overflow-auto custom-scrollbar">
                <List
                  dataSource={notifications}
                  renderItem={(item) => (
                    <div key={item.id} className="p-4 hover:bg-dark-50/50 cursor-pointer transition-colors flex gap-4 border-b border-dark-50 last:border-none">
                      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${item.bg}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-dark-900 leading-tight">{item.title}</p>
                        <p className="text-xs text-dark-500 mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-dark-300 font-medium">
                          <Clock size={10} />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="p-3 bg-dark-50/30 text-center border-t border-dark-50">
                <Button type="text" className="text-sm font-bold text-dark-600 hover:text-primary-600 w-full">
                  Ver todas as notificações
                </Button>
              </div>
            </div>
          )}
        >
          <Badge count={3} offset={[-2, 5]} className="cursor-pointer">
            <div className="p-2 hover:bg-background rounded-full transition-colors">
              <Bell size={22} className="text-dark-500" />
            </div>
          </Badge>
        </Dropdown>
        
        {/* DROPDOWN DE USUÁRIO */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['hover']}
          placement="bottomRight"
          overlayClassName="min-w-[240px]"
          dropdownRender={(menu) => (
            <div className="bg-white rounded-xl shadow-card border border-dark-100 overflow-hidden">
              <div className="p-4 bg-dark-50/30">
                <p className="text-sm font-bold text-dark-900 leading-none">Timóteo Silva</p>
                <p className="text-xs text-dark-400 mt-1">timoteo@amadev.com.br</p>
              </div>
              <Divider className="my-0" />
              {React.cloneElement(menu as React.ReactElement, {
                style: { boxShadow: 'none', border: 'none', padding: '8px' } 
              })}
            </div>
          )}
        >
          <div className="flex items-center gap-3 cursor-pointer group p-1 rounded-xl hover:bg-background transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-dark-900 group-hover:text-primary-500 transition-colors leading-none">Timóteo Silva</p>
              <span className="text-xs text-dark-400">Diretor Técnico</span>
            </div>
            <Avatar 
              size={45} 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Timoteo" 
              className="border-2 border-primary-100 group-hover:border-primary-500 transition-all shadow-sm"
            />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;