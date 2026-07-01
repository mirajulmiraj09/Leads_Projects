import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Injectable,
  inject,
} from '@angular/core';

import {
  map,
  Observable,
} from 'rxjs';

import { MANAGEMENT_CONSOLE_API_ENDPOINTS } from '../constant/management-console-api-endpoints';

import { DashboardDetailRow } from '../model/dashboard-detail-row.types';
import { DashboardKpi } from '../model/dashboard-kpi.types';
import { DashboardSummaryApiResult } from '../model/dashboard-summary-api-result.types';
import { ManagementConsoleApiResponse } from '../model/management-console-api-response.types';

/*
  ============================================================
  Management Console Dashboard API Service
  ============================================================

  Responsibility:
  - Dashboard summary API call
  - Dashboard KPI detail API call
  - API-level Status validation
  - HttpParams build করা

  Authorization:
  - এখানে Bearer token manually add করা হচ্ছে না।
  - Management Console interceptor automatically token attach করবে।
*/
@Injectable({
  providedIn: 'root',
})
export class ManagementConsoleDashboardApi {
  private readonly http = inject(HttpClient);

  /*
    ============================================================
    GET /api/Dashboard/GetDashboardSummary
    ============================================================

    Example:
    ?pDATE=07/01/2026
  */
  getDashboardSummary(
    pDate: string,
  ): Observable<DashboardSummaryApiResult> {
    const params = new HttpParams().set(
      'pDATE',
      pDate,
    );

    return this.http
      .get<
        ManagementConsoleApiResponse<DashboardSummaryApiResult>
      >(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.dashboardSummary,
        { params },
      )
      .pipe(
        map((response) => {
          this.throwIfApiFailed(
            response,
            'Unable to load Dashboard summary.',
          );

          if (!response.Result) {
            throw new Error(
              'Dashboard summary was not returned by the server.',
            );
          }

          return response.Result;
        }),
      );
  }

  /*
    ============================================================
    GET /api/Dashboard/GetDashboardDetails
    ============================================================

    Example:
    ?pKPI=11&pDATE=07/01/2026&pUSER_ID=

    Important:
    - pUSER_ID empty হলেও query parameter পাঠানো হবে।
    - Backend API-এর existing contract অনুযায়ী এটি রাখা হয়েছে।
  */
  getDashboardDetails(
    pKpi: DashboardKpi,
    pDate: string,
    pUserId = '',
  ): Observable<DashboardDetailRow[]> {
    const params = new HttpParams()
      .set('pKPI', String(pKpi))
      .set('pDATE', pDate)
      .set('pUSER_ID', pUserId);

    return this.http
      .get<
        ManagementConsoleApiResponse<DashboardDetailRow[]>
      >(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.dashboardDetails,
        { params },
      )
      .pipe(
        map((response) => {
          this.throwIfApiFailed(
            response,
            `Unable to load Dashboard KPI ${pKpi} details.`,
          );

          /*
            Status: OK হলেও Result: [] / null হতে পারে।
            Grid সবসময় array পাবে।
          */
          return Array.isArray(response.Result)
            ? response.Result
            : [];
        }),
      );
  }

  /*
    ============================================================
    API STATUS VALIDATION
    ============================================================

    Backend HTTP 200 দিলেও Status: FAILED আসতে পারে।
    তাই শুধু HTTP status দেখে success ধরা যাবে না।
  */
  private throwIfApiFailed<T>(
    response: ManagementConsoleApiResponse<T>,
    fallbackMessage: string,
  ): void {
    const isSuccess =
      response?.Status?.trim().toUpperCase() === 'OK';

    if (isSuccess) {
      return;
    }

    throw new Error(
      response?.Message?.trim() ||
        fallbackMessage,
    );
  }
}