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
    ],
  },
];