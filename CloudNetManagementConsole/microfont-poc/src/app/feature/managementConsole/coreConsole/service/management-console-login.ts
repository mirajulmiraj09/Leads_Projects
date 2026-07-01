import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  finalize,
  map,
  Observable,
  of,
  shareReplay,
} from 'rxjs';

import { MANAGEMENT_CONSOLE_API_ENDPOINTS } from '../constant/management-console-api-endpoints';
import {
  ManagementConsoleLoginResponse,
  ManagementConsoleLoginResult,
} from '../model/management-console-login-response.types';
import { ManagementConsoleLoginRequest } from '../model/management-console-login-request.types';
import { ManagementConsoleSessionData } from '../model/management-console-session-data.types';
import { ManagementConsoleSession } from './management-console-session';

/*
  Management Console login service

  Responsibility:
  - Temporary static payload দিয়ে Login API POST করা
  - Response থেকে access token extract করা
  - Token expiry resolve করা
  - Session Service দিয়ে localStorage-এ token save করা

  Important:
  - Static username/password শুধুমাত্র temporary testing-এর জন্য।
  - Future login UI / backend token exchange এলে শুধু payload source replace হবে।
*/
@Injectable({
  providedIn: 'root',
})
export class ManagementConsoleLogin {
  /*
    একই সময়ে একাধিক Management Console page click হলে
    duplicate login API call যেন না হয়।
  */
  private loginRequestInFlight$: Observable<void> | null = null;

  /*
    Temporary static login payload.

    Later:
    - Login UI থেকে value এলে
    - অথবা Keycloak user থেকে backend token exchange হলে
    শুধু এই payload source replace করলেই হবে।
  */
  private readonly staticLoginPayload: ManagementConsoleLoginRequest = {
    UserName: 'DOB2',
    Password: '1',
    ImeiOrIP: '192.168.51.244',
    OTP: '',
    TPIN: '',
  };

  constructor(
    private readonly http: HttpClient,
    private readonly managementConsoleSession: ManagementConsoleSession,
  ) {}

  /*
    Guard এই method call করবে।

    Token valid থাকলে নতুন Login API call করবে না।
    Token না থাকলে বা expired হলে Login API call করবে।
  */
  loginUsingStaticCredentials(): Observable<void> {
    /*
      Existing valid token থাকলে Login API call হবে না।
    */
    if (this.managementConsoleSession.hasValidAccessToken()) {
      return of(void 0);
    }

    /*
      একই সময়ে একাধিক route/API trigger হলে
      existing login request reuse হবে।
    */
    if (this.loginRequestInFlight$) {
      return this.loginRequestInFlight$;
    }

    const loginRequest$ = this.http
      .post<ManagementConsoleLoginResponse>(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.login,
        this.staticLoginPayload,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        },
      )
      .pipe(
        map((response) => {
          const session = this.createSessionFromLoginResponse(response);

          /*
            এখানে Session Service দিয়ে token localStorage-এ save হবে।
          */
          this.managementConsoleSession.saveSession(session);
        }),

        /*
          Login success/fail যাই হোক request complete হলে
          in-flight reference clear হবে।
        */
        finalize(() => {
          this.loginRequestInFlight$ = null;
        }),

        /*
          একই login request multiple subscriber পেলে
          API call একবারই হবে।
        */
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );

    this.loginRequestInFlight$ = loginRequest$;

    return loginRequest$;
  }

  /*
    Console logout করার সময় future-এ এই method use হবে।

    Backend Logout API পরে add করা যাবে।
    এখন শুধু localStorage session clean করবে।
  */
  clearLocalConsoleSession(): void {
    this.managementConsoleSession.clearSession();
  }

  /*
    API response validate করে session object তৈরি করে।
  */
  private createSessionFromLoginResponse(
    response: ManagementConsoleLoginResponse,
  ): ManagementConsoleSessionData {
    const isSuccessful =
      response?.Status?.trim().toUpperCase() === 'OK';

    if (!isSuccessful) {
      throw new Error(
        response?.Message?.trim() ||
          'Management Console login failed.',
      );
    }

    const loginResult = response.Result;

    const accessToken = this.extractAccessToken(loginResult);

    if (!accessToken) {
      throw new Error(
        'Management Console login response did not contain an access token.',
      );
    }

    return {
      accessToken,
      refreshToken: this.extractRefreshToken(loginResult),
      tokenExpiry: this.extractTokenExpiry(loginResult),
    };
  }

  /*
    Login API Result object থেকে access token বের করবে।

    Temporarily supported:
    - Result: "token"
    - Result.AccessToken
    - Result.accessToken
    - Result.Token
    - Result.token

    Postman-এর exact successful response পাওয়ার পর
    দরকার হলে শুধু correct token field রেখে বাকি fallback remove করা যাবে।
  */
  private extractAccessToken(
    loginResult: ManagementConsoleLoginResult | string | null,
  ): string | null {
    if (typeof loginResult === 'string') {
      return loginResult.trim() || null;
    }

    if (!loginResult) {
      return null;
    }

    const possibleTokenValues = [
       loginResult.access_token,
      loginResult.AccessToken,
      loginResult.accessToken,
      loginResult.Token,
      loginResult.token,
    ];

    for (const tokenValue of possibleTokenValues) {
      if (
        typeof tokenValue === 'string' &&
        tokenValue.trim()
      ) {
        return tokenValue.trim();
      }
    }

    return null;
  }

  /*
    Refresh token থাকলে save হবে।
    Backend refresh token না দিলে null থাকবে।
  */
  private extractRefreshToken(
    loginResult: ManagementConsoleLoginResult | string | null,
  ): string | null {
    if (!loginResult || typeof loginResult === 'string') {
      return null;
    }

    const possibleRefreshTokenValues = [
      loginResult.RefreshToken,
      loginResult.refreshToken,
    ];

    for (const refreshTokenValue of possibleRefreshTokenValues) {
      if (
        typeof refreshTokenValue === 'string' &&
        refreshTokenValue.trim()
      ) {
        return refreshTokenValue.trim();
      }
    }

    return null;
  }

  /*
    Session Service absolute timestamp চায়।

    Supported:
    - ExpiresIn / expiresIn = seconds
    - TokenExpiry / tokenExpiry = date string / seconds / milliseconds

    Backend expiry না দিলে null যাবে।
    তখন Session Service JWT token হলে exp claim থেকে expiry বের করার চেষ্টা করবে।
  */
  private extractTokenExpiry(
    loginResult: ManagementConsoleLoginResult | string | null,
  ): number | null {
    if (!loginResult || typeof loginResult === 'string') {
      return null;
    }

    const expiresIn =
      loginResult.ExpiresIn ?? loginResult.expires_in;

    if (
      typeof expiresIn === 'number' &&
      Number.isFinite(expiresIn) &&
      expiresIn > 0
    ) {
      return Date.now() + expiresIn ;
    }

    const tokenExpiry =
      loginResult.TokenExpiry ?? loginResult.tokenExpiry;

    if (typeof tokenExpiry === 'number') {
      return this.normalizeTimestamp(tokenExpiry);
    }

    if (
      typeof tokenExpiry === 'string' &&
      tokenExpiry.trim()
    ) {
      const numericTimestamp = Number(tokenExpiry);

      if (
        Number.isFinite(numericTimestamp) &&
        numericTimestamp > 0
      ) {
        return this.normalizeTimestamp(numericTimestamp);
      }

      const parsedDateTimestamp = Date.parse(tokenExpiry);

      if (!Number.isNaN(parsedDateTimestamp)) {
        return parsedDateTimestamp;
      }
    }

    return null;
  }

  /*
    API seconds timestamp দিলে milliseconds-এ convert করবে।

    Example:
    1719900000     → seconds
    1719900000000  → milliseconds
  */
  private normalizeTimestamp(timestamp: number): number | null {
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return null;
    }

    /*
      সাধারণত 10-digit Unix timestamp seconds-এ থাকে।
    */
    if (timestamp < 10_000_000_000) {
      return timestamp * 1000;
    }

    return timestamp;
  }
}