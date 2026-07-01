import { Routes } from '@angular/router';

import { managementConsoleAuthGuard } from './coreConsole/guard/management-console-auth-guard';

export const managementConsoleRoutes: Routes = [
    {
        path: '',
        canActivateChild: [managementConsoleAuthGuard],
        children: [
            {
                path: 'test',
                loadComponent: () =>
                    import('./pages/user-creation/user-creation').then(
                        (module) => module.UserCreation,
                    ),
            },
            {
                path: 'test3',
                loadComponent: () =>
                    import('./pages/demo/demo').then(
                        (module) => module.Demo,
                    ),
            },
            {
                path: 'about',
                loadComponent: () =>
                    import('./pages/about/about').then(
                        (module) => module.About,
                    ),
            },
            {
                path: 'notification',
                loadComponent: () =>
                    import('./pages/notification/notification').then(
                        (module) => module.Notification,
                    ),
            },
            {
                path: 'active-product',
                loadComponent: () =>
                    import('./pages/active-product/active-product').then(
                        (module) => module.ActiveProduct,
                    ),
            },
            {
                path: 'news-event',
                loadComponent: () =>
                    import('./pages/news-event/news-event').then(
                        (module) => module.NewsEvent,
                    ),
            },
            {
                path: 'fund-transfer-limit',
                loadComponent: () =>
                    import('./pages/fund-transfer-limit/fund-transfer-limit').then(
                        (module) => module.FundTransferLimit,
                    ),
            },
            {
                path: 'active-session',
                loadComponent: () =>
                    import('./pages/active-session/active-session').then(
                        (module) => module.ActiveSession,
                    ),
            },
            {
                path: 'user-activity-log',
                loadComponent: () =>
                    import('./pages/user-activity-log/user-activity-log').then(
                        (module) => module.UserActivityLog,
                    ),
            },
            {
                path: 'merchant-type',
                loadComponent: () =>
                    import('./pages/merchant-type/merchant-type').then(
                        (module) => module.MerchantType,
                    ),
            },
            {
                path: 'reset-user-password',
                loadComponent: () =>
                    import('./pages/reset-user-password/reset-user-password').then(
                        (module) => module.ResetUserPassword,
                    ),
            },
            {
                path: 'manage-npsbbank',
                loadComponent: () =>
                    import('./pages/manage-npsbbank/manage-npsbbank').then(
                        (module) => module.ManageNPSBBank,
                    ),
            },
            {
                path: 'request-queue',
                loadComponent: () =>
                    import('./pages/request-queue/request-queue').then(
                        (module) => module.RequestQueue,
                    ),
            },
            {
                path: 'reset-tpin',
                loadComponent: () =>
                    import('./pages/reset-tpin/reset-tpin').then(
                        (module) => module.ResetTPin,
                    ),
            },
        ],
    },
];