import { useEffect, useState } from 'react';
import { Dropdown, message } from 'antd';
import { Building2, ChevronsUpDown, Check } from 'lucide-react';
import { authService } from '../modules/Auth/services/auth.service';
import { useAuthContext } from '../modules/Auth/context/AuthContext';

export default function OrganizationSwitcher() {
  const { user } = useAuthContext();
  const [organizations, setOrganizations] = useState<Awaited<ReturnType<typeof authService.myOrganizations>>>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    authService.myOrganizations().then(setOrganizations).catch(() => {});
  }, []);

  // Só faz sentido mostrar o seletor quando a pessoa participa de mais de uma organização.
  if (organizations.length < 2) return null;

  const handleSwitch = async (organizationId: string) => {
    if (organizationId === user?.organization.id || switching) return;
    setSwitching(true);
    try {
      const { token, user: newUser } = await authService.switchOrg(organizationId);
      localStorage.setItem('@iires:token', token);
      localStorage.setItem('@iires:user', JSON.stringify(newUser));
      // Recarrega para garantir que todas as telas busquem dados da nova organização.
      window.location.href = '/dashboard';
    } catch {
      message.error('Não foi possível trocar de organização.');
      setSwitching(false);
    }
  };

  return (
    <Dropdown
      trigger={['hover']}
      placement="bottomLeft"
      dropdownRender={() => (
        <div className="bg-white rounded-xl shadow-card border border-dark-100 overflow-hidden min-w-[260px] py-2">
          <p className="text-xs font-bold text-dark-400 uppercase tracking-widest px-4 py-2">Suas organizações</p>
          {organizations.map((org) => (
            <button
              key={org.organizationId}
              onClick={() => handleSwitch(org.organizationId)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-dark-50 transition-colors"
            >
              <Building2 size={16} className="text-dark-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark-900 truncate">{org.name}</p>
                <p className="text-xs text-dark-400">{org.role}</p>
              </div>
              {org.isCurrent && <Check size={16} className="text-primary-500 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    >
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-background transition-colors text-sm font-semibold text-dark-600 max-w-[200px]">
        <Building2 size={16} className="text-dark-400 shrink-0" />
        <span className="truncate">{user?.organization.name}</span>
        <ChevronsUpDown size={14} className="text-dark-300 shrink-0" />
      </button>
    </Dropdown>
  );
}
