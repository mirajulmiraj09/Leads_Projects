import {Routes} from '@angular/router';
import {UserCreation} from './pages/user-creation/user-creation';

export const managementConsoleRoutes: Routes = [
    {
        path: 'test', loadComponent: () => import('./pages/user-creation/user-creation').then(m => m.UserCreation)
    }
]