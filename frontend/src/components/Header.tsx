/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Clock,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../modules/Auth/context/AuthContext';
import { useAuth } from '../modules/Auth/hooks/useAuth';
import { getAvatarUrl } from '../utils/avatar';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../services/notifications.service';

interface HeaderProps {
  collapsed: boolean;
  onMenuClick: () => void;
}

function notificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success': return <CheckCircle2 size={16} className="text-primary-600" />;
    case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
    case 'error':   return <XCircle size={16} className="text-red-500" />;
    default:        return <Info size={16} className="text-secondary-600" />;
  }
}

function notificationBg(type: Notification['type']) {
  switch (type) {
    case 'success': return 'bg-primary-50';
    case 'warning': return 'bg-yellow-50';
    case 'error':   return 'bg-red-50';
    default:        return 'bg-secondary-50';
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return 'agora';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, deleteOne } = useNotifications();

  const displayName = user?.name ?? '—';
  const displayRole = user?.membership?.role ?? '';
  const avatarUrl = getAvatarUrl(user?.avatarConfig, user?.name ?? 'default');

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n.id);
    if (n.link) navigate(n.link);
  };

  const userMenuItems = [
    { key: 'profile', label: 'Meu Perfil', icon: <User size={16} />, onClick: () => navigate('/profile') },
    { key: 'settings', label: 'Configurações', icon: <Settings size={16} />, onClick: () => navigate('/settings') },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Sair do Sistema',
      icon: <LogOut size={16} />,
      danger: true,
      onClick: logout,
    },
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
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-medium text-primary-600 cursor-pointer hover:underline"
                    onClick={markAllRead}
                  >
                    Marcar todas como lidas
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-dark-400 text-sm">
                    Nenhuma notificação por enquanto.
                  </div>
                ) : (
                  <List
                    dataSource={notifications}
                    renderItem={(item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-4 cursor-pointer transition-colors flex gap-4 border-b border-dark-50 last:border-none group ${
                          item.isRead ? 'opacity-60 hover:opacity-100' : 'hover:bg-dark-50/50'
                        }`}
                      >
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notificationBg(item.type)}`}>
                          {notificationIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-bold leading-tight ${!item.isRead ? 'text-dark-900' : 'text-dark-600'}`}>
                              {item.title}
                              {!item.isRead && (
                                <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary-500 align-middle" />
                              )}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteOne(item.id); }}
                              className="opacity-0 group-hover:opacity-100 shrink-0 text-dark-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-dark-500 mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-dark-300 font-medium">
                            <Clock size={10} />
                            {timeAgo(item.createdAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                )}
              </div>

              <div className="p-3 bg-dark-50/30 text-center border-t border-dark-50">
                <Button type="text" className="text-sm font-bold text-dark-600 hover:text-primary-600 w-full">
                  Ver todas as notificações
                </Button>
              </div>
            </div>
          )}
        >
          <Badge count={unreadCount} offset={[-2, 5]} className="cursor-pointer">
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
                <p className="text-sm font-bold text-dark-900 leading-none">{displayName}</p>
                <p className="text-xs text-dark-400 mt-1">{user?.email}</p>
              </div>
              <Divider className="my-0" />
              {React.cloneElement(menu as React.ReactElement<any>, {
                style: { boxShadow: 'none', border: 'none', padding: '8px' }
              })}
            </div>
          )}
        >
          <div className="flex items-center gap-3 cursor-pointer group p-1 rounded-xl hover:bg-background transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-dark-900 group-hover:text-primary-500 transition-colors leading-none">{displayName}</p>
              {displayRole && <span className="text-xs text-dark-400">{displayRole}</span>}
            </div>
            <Avatar
              size={45}
              src={avatarUrl}
              className="border-2 border-primary-100 group-hover:border-primary-500 transition-all shadow-sm"
            />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
