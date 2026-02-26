import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    // Public routes (Standalone, no layout)
    {
        path: 'auth/login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },

    // Protected routes (Wrapped in MainLayout)
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'search',
                loadComponent: () => import('./pages/search/search-page/search-page').then(m => m.SearchPage)
            },
            {
                path: 'notifications',
                loadComponent: () => import('./pages/notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent)
            },
            {
                path: 'notifications/:id',
                loadComponent: () => import('./pages/notifications/notification-details/notification-details.component').then(m => m.NotificationDetailsComponent)
            },
            {
                path: 'news-feed',
                loadComponent: () => import('./pages/news-feed/news-feed.component').then(m => m.NewsFeedComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./pages/events/events-page.component').then(m => m.EventsPageComponent)
            },
            {
                path: 'directory',
                loadComponent: () => import('./pages/joiners/joiners-page/joiners-page.component').then(m => m.JoinersPageComponent)
            },
            {
                path: 'directory/org-chart',
                loadComponent: () => import('./pages/org-chart/org-chart-page.component').then(m => m.OrgChartPageComponent)
            },
            {
                path: 'joiners',
                redirectTo: 'directory',
                pathMatch: 'full'
            },
            {
                path: 'joiners/manage',
                loadComponent: () => import('./pages/joiners/joiner-management/joiner-management.component').then(m => m.JoinerManagementComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'admin-panel',
                loadComponent: () => import('./pages/admin/admin-support-portal/admin-support-portal.component').then(m => m.AdminSupportPortalComponent),
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'it-support/create',
                loadComponent: () => import('./pages/it-support/ticket-create/ticket-create.component').then(m => m.TicketCreateComponent)
            },
            {
                path: 'it-support/my',
                loadComponent: () => import('./pages/it-support/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent)
            },
            {
                path: 'it-support/:id',
                loadComponent: () => import('./pages/it-support/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
            },

            // --- Expenses Module ---
            {
                path: 'expenses',
                redirectTo: 'expenses/my',
                pathMatch: 'full'
            },
            {
                path: 'expenses/my',
                loadComponent: () => import('./pages/expenses/expenses-dashboard/expenses-dashboard.component').then(m => m.ExpensesDashboardComponent)
            },
            {
                path: 'expenses/approvals',
                loadComponent: () => import('./pages/expenses/manager-expense-approvals/manager-expense-approvals.component').then(m => m.ManagerExpenseApprovalsComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'expenses/:id',
                loadComponent: () => import('./pages/expenses/expense-editor/expense-editor.component').then(m => m.ExpenseEditorComponent)
            },
            {
                path: 'admin/it-support',
                loadComponent: () => import('./pages/it-support/admin/admin-tickets-list/admin-tickets-list.component').then(m => m.AdminTicketsListComponent),
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'admin/it-support/:id',
                loadComponent: () => import('./pages/it-support/admin/admin-ticket-detail/admin-ticket-detail.component').then(m => m.AdminTicketDetailComponent),
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] }
            },
            // Manager Routes
            {
                path: 'manager',
                loadComponent: () => import('./pages/manager/manager-dashboard/manager-dashboard').then(m => m.ManagerDashboardComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'manager/announcements/create',
                loadComponent: () => import('./pages/manager/announcement-form/announcement-form').then(m => m.AnnouncementForm),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'manager/announcements/edit/:id',
                loadComponent: () => import('./pages/manager/announcement-form/announcement-form').then(m => m.AnnouncementForm),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'manager/events/create',
                loadComponent: () => import('./pages/manager/event-form/event-form').then(m => m.EventForm),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'manager/events/edit/:id',
                loadComponent: () => import('./pages/manager/event-form/event-form').then(m => m.EventForm),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'manager/leave',
                loadComponent: () => import('./pages/manager/manager-leave-dashboard/manager-leave-dashboard.component').then(m => m.ManagerLeaveDashboardComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            // LMS Tracking Routes
            {
                path: 'lms/my-progress',
                loadComponent: () => import('./pages/lms/lms-my-progress.component').then(m => m.LmsMyProgressComponent)
            },
            {
                path: 'lms/global-progress',
                loadComponent: () => import('./pages/lms/lms-global-tracking.component').then(m => m.LmsGlobalTrackingComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            {
                path: 'lms/users-progress',
                loadComponent: () => import('./pages/lms/users-progress/users-progress.component').then(m => m.UsersProgressComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            // Leaving Management Routes
            {
                path: 'leave',
                loadComponent: () => import('./pages/leave/leave-dashboard/leave-dashboard.component').then(m => m.LeaveDashboardComponent)
            },
            // Document Management Routes
            {
                path: 'documents',
                loadComponent: () => import('./pages/documents/documents-list/documents-list.component').then(m => m.DocumentsListComponent)
            },
            {
                path: 'admin/documents',
                loadComponent: () => import('./pages/admin/admin-documents/admin-documents.component').then(m => m.AdminDocumentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['MANAGER', 'ADMIN'] }
            },
            // Knowledge Base Routes
            {
                path: 'knowledge-base',
                loadComponent: () => import('./pages/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent)
            },
            {
                path: 'knowledge-base/:id',
                loadComponent: () => import('./pages/knowledge-base/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
            }
        ]
    },

    { path: '**', redirectTo: '' }
];

