import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import { useAuth } from '../modules/Auth/hooks/useAuth';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  useInactivityTimer(logout);

  return (
    // h-screen e overflow-hidden travam a tela inteira [cite: 58, 70]
    <Layout className="h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      
      <Layout 
        className={`transition-all duration-300 flex flex-col h-screen ${
          collapsed ? 'md:ml-[80px]' : 'md:ml-[200px]'
        }`}
      >
        <Header collapsed={collapsed} onMenuClick={() => setCollapsed(!collapsed)} />
        
        {/* flex-1 garante que o conteúdo ocupe o resto da tela, overflow-auto habilita o scroll interno [cite: 70] */}
        <Content className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-8">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;