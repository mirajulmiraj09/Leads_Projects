import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { MANAGEMENT_CONSOLE_API_ENDPOINTS } from '../constant/management-console-api-endpoints';
import { AboutApiResult } from '../model/about-api-result.types';
import { AboutInformation } from '../model/about-information.types';
import { ManagementConsoleApiResponse } from '../model/management-console-api-response.types';

/*
  Responsibility:
  - শুধু About API call করবে
  - Backend response validate করবে
  - Backend model কে UI model-এ map করবে
*/
@Injectable({
  providedIn: 'root',
})
export class ManagementConsoleAboutApi {
  private readonly http = inject(HttpClient);

  getAboutDetails(): Observable<AboutInformation> {
    return this.http
      .get<
        ManagementConsoleApiResponse<AboutApiResult>
      >(
        MANAGEMENT_CONSOLE_API_ENDPOINTS.aboutGetDetail,
      )
      .pipe(
        map((response) => {
          const isSuccess =
            response?.Status?.trim().toUpperCase() === 'OK';

          if (!isSuccess || !response.Result) {
            throw new Error(
              response?.Message?.trim() ||
                'Unable to load About information.',
            );
          }

          return this.mapToAboutInformation(
            response.Result,
          );
        }),
      );
  }

  private mapToAboutInformation(
    response: AboutApiResult,
  ): AboutInformation {
    return {
      aboutId: response.aboutId,
      internationalNumber: response.international?.trim() || '',
      localNumber: response.localNumber?.trim() || '',
      mailAddress: response.mailAddress?.trim() || '',
      officeAddress: response.officeAddress?.trim() || '',
    };
  }
}