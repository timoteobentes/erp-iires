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

import FinanceOverview from '../modules/Finance/pages/Overview';
import PayablesList from '../modules/Finance/pages/Payables/PayablesList';
import PayablesForm from '../modules/Finance/pages/Payables/PayablesForm';
import PayablesView from '../modules/Finance/pages/Payables/PayablesView';
import ReceivablesList from '../modules/Finance/pages/Receivables/ReceivablesList';
import ReceivablesForm from '../modules/Finance/pages/Receivables/ReceivablesForm';
import ReceivablesView from '../modules/Finance/pages/Receivables/ReceivablesView';

import TeamList from '../modules/People/pages/Team/TeamList';
import TeamForm from '../modules/People/pages/Team/TeamForm';
import TeamView from '../modules/People/pages/Team/TeamView';
import VolunteersList from '../modules/People/pages/Volunteers/VolunteersList';
import VolunteersForm from '../modules/People/pages/Volunteers/VolunteersForm';
import VolunteersView from '../modules/People/pages/Volunteers/VolunteersView';
import DonorsList from '../modules/People/pages/Donors/DonorsList';
import DonorsForm from '../modules/People/pages/Donors/DonorsForm';
import DonorsView from '../modules/People/pages/Donors/DonorsView';

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

          {/* Módulo Financeiro */}
          <Route path="/finance" element={<FinanceOverview />} />
          <Route path="/finance/payables" element={<PayablesList />} />
          <Route path="/finance/payables/new" element={<PayablesForm />} />
          <Route path="/finance/payables/:id/edit" element={<PayablesForm />} />
          <Route path="/finance/payables/:id" element={<PayablesView />} />

          <Route path="/finance/receivables" element={<ReceivablesList />} />
          <Route path="/finance/receivables/new" element={<ReceivablesForm />} />
          <Route path="/finance/receivables/:id/edit" element={<ReceivablesForm />} />
          <Route path="/finance/receivables/:id" element={<ReceivablesView />} />

          {/* Módulo Pessoas */}
          <Route path="/people/team" element={<TeamList />} />
          <Route path="/people/team/new" element={<TeamForm />} />
          <Route path="/people/team/:id/edit" element={<TeamForm />} />
          <Route path="/people/team/:id" element={<TeamView />} />
          <Route path="/people/volunteers" element={<VolunteersList />} />
          <Route path="/people/volunteers/new" element={<VolunteersForm />} />
          <Route path="/people/volunteers/:id/edit" element={<VolunteersForm />} />
          <Route path="/people/volunteers/:id" element={<VolunteersView />} />
          <Route path="/people/donors" element={<DonorsList />} />
          <Route path="/people/donors/new" element={<DonorsForm />} />
          <Route path="/people/donors/:id/edit" element={<DonorsForm />} />
          <Route path="/people/donors/:id" element={<DonorsView />} />

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
