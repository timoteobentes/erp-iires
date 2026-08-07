import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import iiresLogoBranca from '../assets/iires-logo-branca.png';
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  BarChart3,
  Network,
  Landmark,
} from 'lucide-react';
import { usePermission } from '../modules/Auth/hooks/usePermission';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canManageFinance, canManageProjects, canViewReports } = usePermission();

  const menuItems = useMemo(() => {
    const items: any[] = [
      { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ];

    items.push({ key: '/projects', icon: <Briefcase size={20} />, label: 'Projetos' });
    items.push({ key: '/institutional-contexts', icon: <Landmark size={20} />, label: 'Contextos Institucionais' });

    if (canManageFinance) {
      items.push({
        key: 'finance_group',
        icon: <DollarSign size={20} />,
        label: 'Financeiro',
        children: [
          { key: '/finance',                  label: 'Visão Geral' },
          { key: '/finance/payables',         label: 'Contas a Pagar' },
          { key: '/finance/receivables',      label: 'Contas a Receber' },
          { key: '/finance/account-plans',    label: 'Plano de Contas' },
          { key: '/finance/cost-centers',     label: 'Centro de Custos' },
        ],
      });
    }

    items.push({
      key: 'people_group',
      icon: <Network size={20} />,
      label: 'Pessoas & Rede',
      children: [
        { key: '/people/members',  label: 'Colaboradores' },
        { key: '/people/donors',   label: 'Doadores' },
        { key: '/people/partners', label: 'Parceiros & Fornecedores' },
      ],
    });

    if (canViewReports) {
      items.push({ key: '/reports', icon: <BarChart3 size={20} />, label: 'Relatórios' });
    }

    return items;
  }, [canManageFinance, canManageProjects, canViewReports]);

  const getOpenKeys = () => {
    if (location.pathname.startsWith('/finance')) return ['finance_group'];
    if (location.pathname.startsWith('/people'))  return ['people_group'];
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
      <div className="flex flex-col h-full">
        <div className="shrink-0 flex items-center justify-center py-6 px-4">
          <img
            src={iiresLogoBranca}
            alt="IIRes Logo"
            className={`transition-all duration-300 ${collapsed ? 'w-8' : 'w-32'}`}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={getOpenKeys()}
            onClick={({ key }) => navigate(key)}
            className="!bg-transparent border-none px-2 custom-dark-menu"
            items={menuItems.map((item) => ({
              ...item,
              className: item.children
                ? 'transition-all duration-200'
                : `!rounded-xl my-1 transition-all duration-200 ${
                    location.pathname === item.key
                      ? '!bg-primary-500 !text-white shadow-lg'
                      : 'hover:!bg-dark-800 !text-dark-300'
                  }`,
            }))}
          />
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
