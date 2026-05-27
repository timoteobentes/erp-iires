import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../modules/Auth/context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth } = useAuthContext();

  // Aguarda a leitura do localStorage para não redirecionar antes de saber se está logado
  if (isLoadingAuth) {
    return null; // ou um componente de loading fullscreen se preferir
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
