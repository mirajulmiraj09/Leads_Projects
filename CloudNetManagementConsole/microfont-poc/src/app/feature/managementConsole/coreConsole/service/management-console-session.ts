import { Injectable } from '@angular/core';

import { MANAGEMENT_CONSOLE_STORAGE_KEYS } from '../constant/management-console-storage-keys';
import { ManagementConsoleSessionData } from '../model/management-console-session-data.types';

/*
  Management Console session service

  Responsibility:
  - Access token localStorage-এ save করা
  - Token read করা
  - Token expiry check করা
  - Token expire হলে localStorage থেকে remove করা
  - JWT token হলে token-এর exp claim থেকে expiry বের করা
*/
@Injectable({
  providedIn: 'root',
})
export class ManagementConsoleSession {
  /*
    Token exact expiry-এর 30 seconds আগে invalid ধরা হবে।

    কারণ token expiry-এর একদম শেষ সময়ে API call গেলে
    backend 401 দিতে পারে।
  */
  private readonly expirySafetyWindowInMilliseconds = 30 * 1000;

  /*
    Token expire হওয়ার সময় localStorage clean করার জন্য timer।
  */
  private expiryCleanupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    /*
      Browser refresh/open হওয়ার পরেও যদি expiry data থাকে,
      তাহলে আবার automatic cleanup schedule হবে।
    */
    this.scheduleExpiryCleanup();
  }

  /*
    Login successful হওয়ার পর token/session save হবে।
  */
  saveSession(session: ManagementConsoleSessionData): void {
    const accessToken = session.accessToken?.trim();

    /*
      Empty token save করা যাবে না।
    */
    if (!accessToken) {
      this.clearSession();
      return;
    }

    const resolvedExpiry = this.resolveTokenExpiry(
      accessToken,
      session.tokenExpiry,
    );

    localStorage.setItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.accessToken,
      accessToken,
    );

    this.setOrRemoveStorageValue(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.refreshToken,
      session.refreshToken,
    );

    this.setOrRemoveStorageValue(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.tokenExpiry,
      resolvedExpiry?.toString() ?? null,
    );

    /*
      Token expiry হলে automatic cleanup timer set হবে।
    */
    this.scheduleExpiryCleanup();
  }

  /*
    শুধু token read করবে।
    এখানে expiry check করা হচ্ছে না।
  */
  getAccessToken(): string | null {
    const accessToken = localStorage.getItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.accessToken,
    );

    return accessToken?.trim() || null;
  }

  /*
    Interceptor-এর জন্য safe method।

    Token valid হলে token return করবে।
    Token expired হলে localStorage clear করে null return করবে।
  */
  getValidAccessToken(): string | null {
    if (!this.hasValidAccessToken()) {
      return null;
    }

    return this.getAccessToken();
  }

  /*
    Current Management Console session object return করবে।
  */
  getSession(): ManagementConsoleSessionData | null {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken:
        localStorage.getItem(
          MANAGEMENT_CONSOLE_STORAGE_KEYS.refreshToken,
        ) || null,
      tokenExpiry: this.getTokenExpiry(),
    };
  }

  /*
    Guard এই method দিয়ে check করবে token আছে এবং valid কি না।
  */
  hasValidAccessToken(): boolean {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return false;
    }

    if (this.isTokenExpired()) {
      /*
        Expired token localStorage-এ রাখা হবে না।
      */
      this.clearSession();

      return false;
    }

    return true;
  }

  /*
    Token expiry check করবে।

    Expiry value না থাকলে false return করবে।
    কারণ backend opaque token দিতে পারে,
    যেটি JWT না এবং যার expiry frontend থেকে জানা সম্ভব নয়।

    ওই ক্ষেত্রে backend যদি 401 দেয়,
    interceptor session clear করবে।
  */
  isTokenExpired(): boolean {
    const tokenExpiry = this.getTokenExpiry();

    if (!tokenExpiry) {
      return false;
    }

    return (
      Date.now() >=
      tokenExpiry - this.expirySafetyWindowInMilliseconds
    );
  }

  /*
    localStorage থেকে সব Management Console session data delete করবে।
  */
  clearSession(): void {
    this.clearExpiryCleanupTimer();

    localStorage.removeItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.accessToken,
    );

    localStorage.removeItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.refreshToken,
    );

    localStorage.removeItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.tokenExpiry,
    );
  }

  /*
    Stored expiry timestamp read করবে।
  */
  getTokenExpiry(): number | null {
    const storedExpiry = localStorage.getItem(
      MANAGEMENT_CONSOLE_STORAGE_KEYS.tokenExpiry,
    );

    if (!storedExpiry) {
      return null;
    }

    const parsedExpiry = Number(storedExpiry);

    /*
      Invalid expiry value হলে শুধু expiry key remove হবে।
      Access token backend 401 না দেওয়া পর্যন্ত থাকবে।
    */
    if (
      !Number.isFinite(parsedExpiry) ||
      parsedExpiry <= 0
    ) {
      localStorage.removeItem(
        MANAGEMENT_CONSOLE_STORAGE_KEYS.tokenExpiry,
      );

      return null;
    }

    return parsedExpiry;
  }

  /*
    Login API যদি explicit expiry দেয়, সেটি priority পাবে।

    না দিলে JWT token-এর payload থেকে exp বের করার চেষ্টা করবে।
  */
  private resolveTokenExpiry(
    accessToken: string,
    providedTokenExpiry: number | null,
  ): number | null {
    if (
      providedTokenExpiry !== null &&
      Number.isFinite(providedTokenExpiry) &&
      providedTokenExpiry > 0
    ) {
      return providedTokenExpiry;
    }

    return this.extractJwtExpiry(accessToken);
  }

  /*
    JWT payload থেকে exp claim read করে milliseconds timestamp return করবে।

    JWT format:
    header.payload.signature
  */
  private extractJwtExpiry(accessToken: string): number | null {
    try {
      const tokenParts = accessToken.split('.');

      if (tokenParts.length !== 3) {
        return null;
      }

      const payloadBase64Url = tokenParts[1];

      const normalizedPayload = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedPayload = normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        '=',
      );

      const payloadText = atob(paddedPayload);

      const payload = JSON.parse(payloadText) as {
        exp?: unknown;
      };

      if (
        typeof payload.exp !== 'number' ||
        !Number.isFinite(payload.exp)
      ) {
        return null;
      }

      /*
        JWT exp seconds-এ দেয়।
        JavaScript Date.now() milliseconds-এ কাজ করে।
      */
      return payload.exp * 1000;
    } catch {
      /*
        Token JWT না হলে বা malformed হলে expiry জানা যাবে না।
      */
      return null;
    }
  }

  /*
    Token expiry-এর সময় automatic localStorage cleanup schedule করে।
  */
  private scheduleExpiryCleanup(): void {
    this.clearExpiryCleanupTimer();

    const tokenExpiry = this.getTokenExpiry();

    /*
      Opaque token / expiry unknown হলে timer লাগবে না।
      ওই ক্ষেত্রে backend 401 response fallback হবে।
    */
    if (!tokenExpiry) {
      return;
    }

    const remainingMilliseconds = tokenExpiry - Date.now();

    /*
      App start হওয়ার আগেই token expire হয়ে গেলে
      সঙ্গে সঙ্গে localStorage clean হবে।
    */
    if (remainingMilliseconds <= 0) {
      this.clearSession();

      return;
    }

    this.expiryCleanupTimer = setTimeout(() => {
      this.clearSession();
    }, remainingMilliseconds);
  }

  private clearExpiryCleanupTimer(): void {
    if (this.expiryCleanupTimer !== null) {
      clearTimeout(this.expiryCleanupTimer);
      this.expiryCleanupTimer = null;
    }
  }

  private setOrRemoveStorageValue(
    storageKey: string,
    value: string | null,
  ): void {
    if (value?.trim()) {
      localStorage.setItem(storageKey, value);

      return;
    }

    localStorage.removeItem(storageKey);
  }
}