import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ActivityLogPayload } from '../model/activity.model';
import { HttpParams } from '@angular/common/http';
import { GlobalResponse } from '../model/globar.model';

@Injectable({
    providedIn: 'root'
})
export class ActivityApiService {
    http = inject(HttpClient);
    baseUrl = environment.managementConsoleApiBaseUrl;

    searchActivityLog(payload: ActivityLogPayload): Observable<GlobalResponse> {
        let params = new HttpParams()
            .set('activityType', payload.activityType ?? '')
            .set('userType', payload.userType)
            .set('UserID', payload.UserID)
            .set('startDate', payload.startDate)
            .set('endTime', payload.endTime);

        return this.http.get<GlobalResponse>(
            `${this.baseUrl}/api/ActivityLog/getActivirtLog`,
            { params }
        );
    }
}