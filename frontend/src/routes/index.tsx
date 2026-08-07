import { Routes, Route, Navigate } from 'react-router-dom';

// Módulos de Autenticação
import LoginModule from '../modules/Login';
import ForgotPasswordModule from '../modules/ForgotPassword';
import ResetPasswordModule from '../modules/ResetPassword';
import AcceptInviteModule from '../modules/AcceptInvite';
import SignUpModule from '../modules/SignUp';

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
import AccountPlansList from '../modules/Finance/pages/AccountPlans/AccountPlansList';
import CostCentersList from '../modules/Finance/pages/CostCenters/CostCentersList';

import MembersList from '../modules/People/pages/Members/MembersList';
import MembersForm from '../modules/People/pages/Members/MembersForm';
import MembersView from '../modules/People/pages/Members/MembersView';
import DonorsList from '../modules/People/pages/Donors/DonorsList';
import DonorsForm from '../modules/People/pages/Donors/DonorsForm';
import DonorsView from '../modules/People/pages/Donors/DonorsView';
import PartnersList from '../modules/People/pages/Partners/PartnersList';
import PartnersForm from '../modules/People/pages/Partners/PartnersForm';
import PartnersView from '../modules/People/pages/Partners/PartnersView';

import ReportsDashboard from '../modules/Reports/pages/ReportsDashboard';

import SystemSettings from '../modules/Settings/pages/SystemSettings';

import UserProfile from '../modules/Profile/pages/UserProfile';
import InstitutionalContextsPage from '../modules/InstitutionalContexts/pages/InstitutionalContextsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<LoginModule />} />
      <Route path="/signup" element={<SignUpModule />} />
      <Route path="/forgot-password" element={<ForgotPasswordModule />} />
      <Route path="/reset-password" element={<ResetPasswordModule />} />
      <Route path="/accept-invite" element={<AcceptInviteModule />} />

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
          <Route path="/institutional-contexts" element={<InstitutionalContextsPage />} />

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

          <Route path="/finance/account-plans" element={<AccountPlansList />} />
          <Route path="/finance/cost-centers" element={<CostCentersList />} />

          {/* Módulo Pessoas — Colaboradores (unificado) */}
          <Route path="/people/members" element={<MembersList />} />
          <Route path="/people/members/new" element={<MembersForm />} />
          <Route path="/people/members/:kind/:id/edit" element={<MembersForm />} />
          <Route path="/people/members/:kind/:id" element={<MembersView />} />
          {/* Redirects legados */}
          <Route path="/people/team" element={<Navigate to="/people/members" replace />} />
          <Route path="/people/team/*" element={<Navigate to="/people/members" replace />} />
          <Route path="/people/volunteers" element={<Navigate to="/people/members" replace />} />
          <Route path="/people/volunteers/*" element={<Navigate to="/people/members" replace />} />
          <Route path="/people/donors" element={<DonorsList />} />
          <Route path="/people/donors/new" element={<DonorsForm />} />
          <Route path="/people/donors/:id/edit" element={<DonorsForm />} />
          <Route path="/people/donors/:id" element={<DonorsView />} />
          <Route path="/people/partners" element={<PartnersList />} />
          <Route path="/people/partners/new" element={<PartnersForm />} />
          <Route path="/people/partners/:id/edit" element={<PartnersForm />} />
          <Route path="/people/partners/:id" element={<PartnersView />} />

          {/* Módulo Relatórios */}
          <Route path="/reports" element={<ReportsDashboard />} />

          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/profile" element={<UserProfile />} />
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
