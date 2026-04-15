import React from 'react';
import { Layout, Button, Dropdown, MenuProps, Avatar, Badge, Popover, List } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AppHeader({ collapsed, setCollapsed }: HeaderProps) {
  const navigate = useNavigate();

  // Menu do Perfil
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: () => navigate('/login'),
    },
  ];

  // Placeholder de Notificações
  const notificationData = [
    { title: 'Novo projeto aprovado', description: 'O projeto Educação para o Futuro começou.' },
    { title: 'Meta atingida!', description: 'Arrecadação de Inverno superou R$ 50k.' },
  ];

  const notificationContent = (
    <List
      className="w-72"
      itemLayout="horizontal"
      dataSource={notificationData}
      renderItem={(item) => (
        <List.Item className="cursor-pointer hover:bg-gray-50 px-3 sm:px-4 transition-colors">
          <List.Item.Meta
            title={<span className="text-[13px] font-medium text-gray-800">{item.title}</span>}
            description={<span className="text-[12px] text-gray-500 leading-tight">{item.description}</span>}
          />
        </List.Item>
      )}
    />
  );

  return (
    <AntHeader 
      className="bg-surface/80 backdrop-blur-md flex items-center justify-between border-b border-gray-100 h-16 shadow-[0_2px_8px_0_rgba(0,0,0,0.02)] z-40 px-0 transition-all duration-300 ease-in-out"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: collapsed ? 80 : 256,
        padding: 0,
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 flex-1 h-full">
        {/* Botão Colapsar Sidebar */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed?.(!collapsed)}
          className="text-[18px] w-16 h-16 rounded-none m-0 hover:bg-gray-50 text-gray-600 transition-colors"
        />
        
        {/* Search Input - Estilo Premium */}
        <div className="max-w-md relative hidden sm:block ml-2 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <SearchOutlined className="text-[15px]" />
          </span>
          <input 
            type="text" 
            placeholder="Buscar projetos..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 hover:bg-white focus:bg-white rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 transition-all placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center gap-4 sm:gap-6 pr-6 h-full">
        {/* Notificações */}
        <Popover 
          placement="bottomRight" 
          content={notificationContent} 
          title={<span className="px-2 pt-1 block text-gray-800">Notificações</span>} 
          trigger="click"
        >
          <button className="text-gray-400 hover:text-gray-700 transition-colors mt-1">
            <Badge count={2} size="small" offset={[-2, 4]} color="#FF4D4F">
              <div className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <BellOutlined className="text-[19px] text-gray-600 cursor-pointer block" />
              </div>
            </Badge>
          </button>
        </Popover>

        {/* Perfil Hover/Click Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 px-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <Avatar className="bg-primary-50 text-primary-600 border border-primary-200" icon={<UserOutlined />} />
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-semibold text-gray-700 leading-none mb-1">Administrador</span>
              <span className="text-[11px] text-gray-500 leading-none">admin@iires.org</span>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
