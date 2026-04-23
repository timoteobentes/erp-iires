import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  DollarSign, 
  Users, 
  BarChart3
} from 'lucide-react';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Removido "Configurações" daqui
  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { key: '/projects', icon: <Briefcase size={20} />, label: 'Projetos' },
    { key: '/finance', icon: <DollarSign size={20} />, label: 'Financeiro' },
    { key: '/crm', icon: <Users size={20} />, label: 'CRM' },
    { key: '/reports', icon: <BarChart3 size={20} />, label: 'Relatórios' },
  ];

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
        onClick={({ key }) => navigate(key)}
        className="!bg-transparent border-none px-2"
        items={menuItems.map(item => ({
          ...item,
          className: `!rounded-xl my-1 transition-all duration-200 ${
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