import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  BarChart3,
  Network
} from 'lucide-react';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Arquitetura de Informação Refinada
  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    
    // Core do Instituto
    { key: '/projects', icon: <Briefcase size={20} />, label: 'Projetos' },
    
    // Módulo Financeiro com Submenus
    { 
      key: 'finance_group', 
      icon: <DollarSign size={20} />, 
      label: 'Financeiro',
      children: [
        { key: '/finance', label: 'Visão Geral' },
        { key: '/finance/payables', label: 'Contas a Pagar' },
        { key: '/finance/receivables', label: 'Contas a Receber' },
      ]
    },
    
    // Substituindo o CRM/Cadastros por "Pessoas & Rede"
    { 
      key: 'people_group', 
      icon: <Network size={20} />, 
      label: 'Pessoas & Rede',
      children: [
        { key: '/people/team', label: 'Equipe Interna' },
        { key: '/people/volunteers', label: 'Voluntários' },
        { key: '/people/donors', label: 'Doadores' },
        { key: '/people/partners', label: 'Parceiros & Fornecedores' },
      ]
    },
    
    { key: '/reports', icon: <BarChart3 size={20} />, label: 'Relatórios' },
  ];

  // Função auxiliar para manter o menu pai aberto se um submenu estiver ativo
  const getOpenKeys = () => {
    if (location.pathname.startsWith('/finance')) return ['finance_group'];
    if (location.pathname.startsWith('/people')) return ['people_group'];
    return [];
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      trigger={null}
      breakpoint="lg"
      collapsedWidth="80"
      className="hidden md:block h-screen fixed left-0 top-0 bottom-0 z-50 !bg-dark-900 border-r border-dark-800 shadow-xl"
    >
      <div className="flex items-center justify-center py-6 px-4">
        <img 
          src="/src/assets/iires-logo-branca.png" 
          alt="IIRes Logo" 
          className={`transition-all duration-300 ${collapsed ? 'w-8' : 'w-32'}`} 
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={getOpenKeys()}
        onClick={({ key }) => navigate(key)}
        className="!bg-transparent border-none px-2 custom-dark-menu"
        items={menuItems.map(item => ({
          ...item,
          // Verifica se é um grupo (tem filhos) ou um link direto para aplicar as classes
          className: item.children 
            ? 'transition-all duration-200' 
            : `!rounded-xl my-1 transition-all duration-200 ${
                location.pathname === item.key 
                ? '!bg-primary-500 !text-white shadow-lg' 
                : 'hover:!bg-dark-800 !text-dark-300'
              }`
        }))}
      />

      <span className="absolute bottom-6 w-full px-4 text-center text-dark-400 text-xs">Versão 1.0.0</span>
    </Sider>
  );
};

export default Sidebar;