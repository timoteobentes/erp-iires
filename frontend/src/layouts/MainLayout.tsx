import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppstoreOutlined, 
  ProjectOutlined, 
  DollarOutlined, 
  TeamOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  GlobalOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', label: 'Dashboard', icon: <AppstoreOutlined /> },
    { key: '/projetos', label: 'Projetos', icon: <ProjectOutlined /> },
    { key: '/financeiro', label: 'Financeiro', icon: <DollarOutlined /> },
    { key: '/crm', label: 'CRM', icon: <TeamOutlined /> },
    { key: '/relatorios', label: 'Relatórios', icon: <BarChartOutlined /> },
    { key: '/configuracoes', label: 'Configurações', icon: <SettingOutlined /> },
  ];

  // Ícone de Lua simples desenhado em SVG 
  const MoonIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-900 transition-colors">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );

  return (
    <Layout className="min-h-screen font-sans">
      
      {/* SIDEBAR (Sider) */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
        collapsedWidth={80}
        style={{ background: '#fff' }}
        className="border-r border-gray-100 shadow-[2px_0_8px_0_rgba(0,0,0,0.02)] z-20"
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-center border-b border-gray-50 overflow-hidden px-4">
          {collapsed ? (
            <img src="/src/assets/logo-original.png" alt="Logo" className="h-6 w-auto object-contain" />
          ) : (
            <img src="/src/assets/logo-original.png" alt="IIRes Logo" className="h-8 w-auto mix-blend-multiply" />
          )}
        </div>
        
        {/* MENU */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ borderRight: 0 }}
          className="mt-6 font-medium text-[14px] text-gray-600"
        />
      </Sider>

      {/* CORE LAYOUT DA ÁREA PRINCIPAL */}
      <Layout>
        
        {/* HEADER */}
        <Header 
          style={{ padding: 0, background: '#fff' }}
          className="bg-white flex items-center justify-between px-6 border-b border-gray-100 shadow-sm z-10"
        >
          {/* Lado Esquerdo: Toggle de Sidebar e Busca */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:bg-gray-50 flex items-center justify-center w-10 h-10"
            />
            
            <div className="relative hidden sm:block w-72">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar projetos ou atividades..." 
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent rounded-full text-sm focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex gap-4 items-center">
            {/* Ícone de Dark Mode (Placeholder Lua) */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-50 cursor-pointer">
              <MoonIcon />
            </div>
            
            {/* Ícone de Idioma / Global */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-50 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors">
              <GlobalOutlined className="text-[18px]" />
            </div>

            {/* Ícone de Sino (Notificações) */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-50 cursor-pointer text-gray-500 hover:text-gray-900 transition-colors mr-2">
              <Badge count={2} size="small" offset={[0, 2]} color="#FF4D4F">
                <BellOutlined className="text-[18px] ml-1" />
              </Badge>
            </div>

            {/* Perfil Dropdown */}
            <Dropdown 
              menu={{ 
                items: [
                  { key: 'perfil', label: 'Acessar Perfil', icon: <UserOutlined /> },
                  { type: 'divider' },
                  { key: 'sair', label: 'Sair da Conta', danger: true, onClick: () => navigate('/login') }
                ] 
              }} 
              trigger={['click']} placement="bottomRight"
            >
              <div className="flex items-center gap-3 cursor-pointer pl-3 border-l border-gray-100 hover:opacity-80 transition-opacity">
                <Avatar className="bg-primary-50 text-primary-600 border border-primary-100 font-semibold text-sm" size="default">
                  A
                </Avatar>
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold text-gray-800">Administrador</span>
                  <span className="text-[11px] text-gray-500">Ver Perfil</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* CONTENT (Área Central) */}
        <Content className="bg-slate-50 p-6 min-h-screen">
          <Outlet />
        </Content>
        
      </Layout>
    </Layout>
  );
}
