import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GlobalResponse } from '../model/globar.model';
import { ActiveSessionRequest } from '../model/activity.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RequestQueueApiService {
    http = inject(HttpClient);
    baseUrl = environment.managementConsoleApiBaseUrl;

    getRequestQueue(request: ActiveSessionRequest): Observable<GlobalResponse> {
        const params = new HttpParams()
            .set('BranchId', request.branchId.toString())
            .set('UserID', request.userId)
            .set('requestType', request.requestType)
            .set('startDate', request.startDate)
            .set('endTime', request.endTime)
            .set('statusType', request.statusType);
        return this.http.get<GlobalResponse>(`${this.baseUrl}/api/Authorization/GetUserRequests`,
            { params });
    }

}