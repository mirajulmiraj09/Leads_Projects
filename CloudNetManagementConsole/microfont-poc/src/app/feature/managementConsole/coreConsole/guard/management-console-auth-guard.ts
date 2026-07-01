import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  Router,
} from '@angular/router';
import {
  catchError,
  map,
  of,
} from 'rxjs';

import { MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES } from '../constant/management-console-route-constants';
import { ManagementConsoleLogin } from '../service/management-console-login';
import { ManagementConsoleSession } from '../service/management-console-session';

/*
  Management Console route guard

  Flow:
  1. Valid Console token থাকলে route open করবে।
  2. Token না থাকলে বা expired হলে Login API call করবে।
  3. Login success হলে token localStorage-এ save হবে।
  4. তারপর requested Console page open হবে।
  5. Login failed হলে Microfont POC home-এ redirect হবে।
*/
export const managementConsoleAuthGuard: CanActivateChildFn = () => {
  const router = inject(Router);

  const managementConsoleSession = inject(
    ManagementConsoleSession,
  );

  const managementConsoleLogin = inject(
    ManagementConsoleLogin,
  );

  /*
    Token আছে এবং valid হলে Login API call হবে না।
  */
  if (managementConsoleSession.hasValidAccessToken()) {
    return true;
  }

  /*
    First Management Console page access:
    Login API call হবে।
  */
  return managementConsoleLogin
    .loginUsingStaticCredentials()
    .pipe(
      map(() => true),

      catchError((error: unknown) => {
        console.error(
          'Management Console login failed:',
          error,
        );

        /*
          Failed login হলে stale/invalid token থাকলে remove হবে।
        */
        managementConsoleLogin.clearLocalConsoleSession();

        /*
          Console login fail হলে normal Microfont home-এ যাবে।
        */
        return of(
          router.parseUrl(
            MANAGEMENT_CONSOLE_ABSOLUTE_ROUTES.microfontHome,
          ),
        );
      }),
    );
};