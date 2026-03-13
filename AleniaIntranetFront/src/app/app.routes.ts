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
                data: { roles: ['HR'] }
            },

            // HR Chat Support
            {
                path: 'hr/chat-support',
                loadComponent: () => import('./pages/hr/hr-chat-dashboard/hr-chat-dashboard.component').then(m => m.HrChatDashboardComponent),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            // HR Admin Routes
            {
                path: 'hr',
                loadComponent: () => import('./pages/hr/hr-board/hr-board').then(m => m.HrBoardComponent),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            {
                path: 'hr/announcements/create',
                loadComponent: () => import('./pages/hr/announcement-form/announcement-form').then(m => m.AnnouncementForm),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            {
                path: 'hr/announcements/edit/:id',
                loadComponent: () => import('./pages/hr/announcement-form/announcement-form').then(m => m.AnnouncementForm),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            {
                path: 'hr/events/create',
                loadComponent: () => import('./pages/hr/event-form/event-form').then(m => m.EventForm),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            {
                path: 'hr/events/edit/:id',
                loadComponent: () => import('./pages/hr/event-form/event-form').then(m => m.EventForm),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            // LMS Tracking Routes
            {
                path: 'lms/my-progress',
                loadComponent: () => import('./pages/lms/lms-my-progress.component').then(m => m.LmsMyProgressComponent)
            },
            {
                path: 'lms/users-progress',
                loadComponent: () => import('./pages/lms/users-progress/users-progress.component').then(m => m.UsersProgressComponent),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            // Document Management Routes
            {
                path: 'documents',
                loadComponent: () => import('./pages/documents/documents-list/documents-list.component').then(m => m.DocumentsListComponent)
            },
            {
                path: 'hr/documents',
                loadComponent: () => import('./pages/hr/hr-documents/hr-documents.component').then(m => m.HrDocumentsComponent),
                canActivate: [roleGuard],
                data: { roles: ['HR'] }
            },
            // Knowledge Base Routes
            {
                path: 'knowledge-base',
                loadComponent: () => import('./pages/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent)
            },
            {
                path: 'knowledge-base/:id',
                loadComponent: () => import('./pages/knowledge-base/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
            },
            // All Things HR Routes
            {
                path: 'hr/spain',
                loadComponent: () => import('./pages/hr/spain-hr/spain-hr.component').then(m => m.SpainHrComponent)
            },
            {
                path: 'hr/portugal',
                loadComponent: () => import('./pages/hr/portugal-hr/portugal-hr.component').then(m => m.PortugalHrComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];

