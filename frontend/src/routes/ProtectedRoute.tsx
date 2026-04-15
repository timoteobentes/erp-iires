import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Mock de autenticação temporário.
  // Futuramente, substitua por um hook global: const { isAuthenticated } = useAuth();
  const isAuthenticated = true; // Mude para false para testar o redirecionamento para o /login

  if (!isAuthenticated) {
    // Redireciona para o login caso não esteja autenticado
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza as rotas filhas
  return <Outlet />;
}
