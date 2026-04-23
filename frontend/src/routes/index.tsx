import { Routes, Route, Navigate } from 'react-router-dom';

// Módulos de Autenticação
import LoginModule from '../modules/Login';
import SignUpModule from '../modules/SignUp';
import ForgotPasswordModule from '../modules/ForgotPassword';
import ResetPasswordModule from '../modules/ResetPassword';

// Componentes de Layout
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Módulos
import Dashboard from '../modules/Dashboard/pages';
import ListProjects from '../modules/Projects/pages/List';
import FormProjects from '../modules/Projects/pages/Form';
import ViewProjects from '../modules/Projects/pages/View';

// Placeholders para novos módulos
const Placeholder = ({ name }: { name: string }) => <div className="p-6"><h1>{name} (Em breve)</h1></div>;

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginModule />} />
      <Route path="/signup" element={<SignUpModule />} />
      <Route path="/forgot-password" element={<ForgotPasswordModule />} />
      <Route path="/reset-password" element={<ResetPasswordModule />} />

      {/* Área Logada */}
      <Route element={<ProtectedRoute />}>
        {/* Layout Principal Envolvendo a Área Logada */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Módulo de Projetos */}
          <Route path="/projects" element={<ListProjects />} />
          <Route path="/projects/new" element={<FormProjects />} />
          <Route path="/projects/:id/edit" element={<FormProjects />} />
          <Route path="/projects/:id" element={<ViewProjects />} />

          {/* Novos Módulos (Skeletons) */}
          <Route path="/finance" element={<Placeholder name="Financeiro" />} />
          <Route path="/crm" element={<Placeholder name="CRM" />} />
          <Route path="/reports" element={<Placeholder name="Relatórios" />} />
          <Route path="/settings" element={<Placeholder name="Configurações" />} />
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
