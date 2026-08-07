import { Router } from 'express';
import authRoutes from './modules/Auth/auth.routes.js';
import teamRoutes from './modules/People/Team/team.routes.js';
import volunteersRoutes from './modules/People/Volunteers/volunteers.routes.js';
import donorsRoutes from './modules/People/Donors/donors.routes.js';
import partnersRoutes from './modules/People/Partners/partners.routes.js';
import projectsRoutes from './modules/Projects/projects.routes.js';
import transactionsRoutes from './modules/Financial/Transactions/transactions.routes.js';
import reportsRoutes from './modules/Reports/reports.routes.js';
import notificationsRoutes from './modules/Notifications/notifications.routes.js';
import accountPlansRoutes from './modules/Financial/AccountPlans/account-plans.routes.js';
import costCentersRoutes from './modules/Financial/CostCenters/cost-centers.routes.js';
import institutionalContextsRoutes from './modules/InstitutionalContexts/institutional-contexts.routes.js';
import organizationsRoutes from './modules/Organizations/organizations.routes.js';
import membershipsRoutes from './modules/Organizations/memberships.routes.js';
import rolesRoutes from './modules/Organizations/roles.routes.js';
import invitesRoutes from './modules/Organizations/invites.routes.js';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/team', teamRoutes);
routes.use('/volunteers', volunteersRoutes);
routes.use('/donors', donorsRoutes);
routes.use('/partners', partnersRoutes);
routes.use('/projects', projectsRoutes);
routes.use('/transactions', transactionsRoutes);
routes.use('/reports', reportsRoutes);
routes.use('/notifications', notificationsRoutes);
routes.use('/account-plans', accountPlansRoutes);
routes.use('/cost-centers', costCentersRoutes);
routes.use('/institutional-contexts', institutionalContextsRoutes);
routes.use('/organizations', organizationsRoutes);
routes.use('/memberships', membershipsRoutes);
routes.use('/roles', rolesRoutes);
routes.use('/invites', invitesRoutes);

export default routes;
