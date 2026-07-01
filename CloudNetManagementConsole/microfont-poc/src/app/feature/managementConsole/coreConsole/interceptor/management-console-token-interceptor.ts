import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  throwError,
} from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { MANAGEMENT_CONSOLE_API_ENDPOINTS } from '../constant/management-console-api-endpoints';
import { ManagementConsoleSession } from '../service/management-console-session';

/*
  Management Console token interceptor

  Rules:
  - শুধু Management Console API base URL-এর request-এ কাজ করবে।
  - Login API-তে কোনো Bearer token যাবে না।
  - Protected Management Console API-তে Console token attach হবে।
  - Backend থেকে 401 এলে Console token localStorage থেকে remove হবে।
  - Existing Keycloak / Sentinel token system untouched থাকবে।
*/
export const managementConsoleTokenInterceptor: HttpInterceptorFn = (
  request,
  next,
) => {
  const managementConsoleSession = inject(
    ManagementConsoleSession,
  );

  const isManagementConsoleApiRequest =
    request.url.startsWith(
      environment.managementConsoleApiBaseUrl,
    );

  /*
    অন্য Microfont / Sentinel / Keycloak API request untouched থাকবে।
  */
  if (!isManagementConsoleApiRequest) {
    return next(request);
  }

  const isLoginRequest = request.url.startsWith(
    MANAGEMENT_CONSOLE_API_ENDPOINTS.login,
  );

  /*
    Login API request-এ কোনো পুরোনো Authorization header থাকলেও
    remove করে পাঠানো হবে।
  */
  if (isLoginRequest) {
    const cleanLoginRequest = request.clone({
      headers: request.headers.delete('Authorization'),
    });

    return next(cleanLoginRequest);
  }

  /*
    Valid Console token থাকলে Bearer attach হবে।
    Expired token থাকলে Session Service token clear করে null return করবে।
  */
  const accessToken =
    managementConsoleSession.getValidAccessToken();

  const authorizedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      /*
        Backend যদি বলে token invalid / expired,
        localStorage session clear হবে।
      */
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        managementConsoleSession.clearSession();
      }

      return throwError(() => error);
    }),
  );
};