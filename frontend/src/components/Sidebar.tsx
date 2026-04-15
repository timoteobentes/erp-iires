import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  AppstoreOutlined, 
  ProjectOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  BarChartOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: '/dashboard', label: 'Dashboard', icon: <AppstoreOutlined /> },
    { key: '/projetos', label: 'Projetos', icon: <ProjectOutlined /> },
    { key: '/financeiro', label: 'Financeiro', icon: <DollarOutlined /> },
    { key: '/crm', label: 'CRM', icon: <TeamOutlined /> },
    { key: '/relatorios', label: 'Relatórios', icon: <BarChartOutlined /> },
    { key: '/configuracoes', label: 'Configurações', icon: <SettingOutlined /> },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      theme="light"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
      }}
      className="border-r border-gray-100 shadow-[2px_0_8px_0_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out font-sans"
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-50 overflow-hidden px-4">
        {collapsed ? (
          <img src="/src/assets/logo-original.png" alt="Logo" className="h-6 w-auto object-contain" />
        ) : (
          <img src="/src/assets/logo-original.png" alt="IIRes Logo" className="h-8 w-auto mix-blend-multiply" />
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={items}
        className="mt-6 border-r-0 font-medium text-[14px]"
      />
    </Sider>
  );
}
