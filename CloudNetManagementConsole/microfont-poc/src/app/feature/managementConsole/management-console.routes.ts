import {Routes} from '@angular/router';
import {UserCreation} from './pages/user-creation/user-creation'  
export const managementConsoleRoutes: Routes = [
    {
        path: 'test', loadComponent: () => import('./pages/user-creation/user-creation').then(m => m.UserCreation)
    },
    {
        path: 'active-product', loadComponent: () => import('./pages/active-product/active-product').then(m => m.ActiveProduct)
    },
    {
        path: 'news-event', loadComponent: () => import('./pages/news-event/news-event').then(m => m.NewsEvent)
    },{
        path: 'notification', loadComponent: () => import('./pages/notification/notification').then(m => m.Notification)
    }
]