import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { MANAGEMENT_CONSOLE_API_ENDPOINTS } from '../constant/management-console-api-endpoints';
import { ContactApiResult } from '../model/contact-api-result.types';
import { ContactInformation } from '../model/contact-information.types';
import { ContactUpdateRequest } from '../model/contact-update-request.types';
import { ManagementConsoleApiResponse } from '../model/management-console-api-response.types';

/*
  ============================================================
  Management Console Contact API Service
  ============================================================

  Responsibility:
  - Contact details GET করা
  - Contact details edit API call করা
  - API-level Status / Message validate করা
  - Backend result কে UI model-এ map করা

  Authorization header manually add করা হচ্ছে না।
  Management Console interceptor Bearer token attach করবে।
*/
@Injectable({
  providedIn: 'root',
})
export class ManagementConsoleContactApi {
  private readonly http = inject(HttpClient);

  /*
    ============================================================
    GET /api/About/getContactDetails
    ============================================================
  */
  getContactDetails(): Observable<ContactInformation> {
    return this.http
      .get<
        ManagementConsoleApiResponse<ContactApiResult>
      >(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.contactGetDetails,
      )
      .pipe(
        map((response) => {
          this.throwIfApiFailed(
            response,
            'Unable to load Contact information.',
          );

          if (!response.Result) {
            throw new Error(
              'Contact information was not returned by the server.',
            );
          }

          return this.mapToContactInformation(
            response.Result,
          );
        }),
      );
  }

  /*
    ============================================================
    POST /api/About/editContactDetails
    ============================================================

    Backend যদি POST-এর বদলে PUT চায়:
    শুধু নিচের .post(...) কে .put(...) করবে।
  */
  updateContactDetails(
    payload: ContactUpdateRequest,
  ): Observable<void> {
    return this.http
      .post<
        ManagementConsoleApiResponse<unknown>
      >(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.contactEditDetails,
        payload,
      )
      .pipe(
        map((response) => {
          /*
            HTTP 200 হলেও Status: FAILED আসতে পারে।
            তাই API-level status check করা mandatory।
          */
          this.throwIfApiFailed(
            response,
            'Unable to update Contact information.',
          );

          return void 0;
        }),
      );
  }

  /*
    ============================================================
    API RESPONSE VALIDATION
    ============================================================
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

  /*
    ============================================================
    BACKEND RESULT → UI MODEL
    ============================================================
  */
  private mapToContactInformation(
    response: ContactApiResult,
  ): ContactInformation {
    return {
      callCenterHotlineNumber:
        response.callCenterHotLine?.trim() || '',

      emailAddress:
        response.contactEmailAddress?.trim() || '',
    };
  }
}