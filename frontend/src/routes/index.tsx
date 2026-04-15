import { Routes, Route, Navigate } from 'react-router-dom';
import LoginModule from '../modules/Login';
import SignUpModule from '../modules/SignUp';
import ForgotPasswordModule from '../modules/ForgotPassword';
import ResetPasswordModule from '../modules/ResetPassword';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { Dashboard } from '../pages/Dashboard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginModule />} />
      <Route path="/signup" element={<SignUpModule />} />
      <Route path="/forgot-password" element={<ForgotPasswordModule />} />
      <Route path="/reset-password" element={<ResetPasswordModule />} />

      {/* Grupo de Rotas Privadas */}
      <Route element={<ProtectedRoute />}>
        {/* Layout Principal Envolvendo a Área Logada */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Adicione outras rotas fechadas aqui no futuro (Ex: /projetos) */}
        </Route>
      </Route>

      {/* Fallback de rotas */}
      {/* Redireciona a rota raiz / para o dashboard. Se o usuário não usar logado, o ProtectedRoute manda p/ o login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Redireciona qualquer URL não mapeada para a raiz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
