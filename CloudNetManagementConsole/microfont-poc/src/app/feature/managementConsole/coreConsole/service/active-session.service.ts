import {Injectable} from '@angular/core';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {GlobalResponse} from '../model/globar.model';

@Injectable({
    providedIn: 'root'
})
export class ActiveSessionApiService {
    http = inject(HttpClient);
    baseUrl = environment.managementConsoleApiBaseUrl;

    getActiveSessions(userID:string): Observable<GlobalResponse> {
        return this.http.get<GlobalResponse>(`${this.baseUrl}/api/CombinedFeatures/GetUserActiveSession?UserID=${userID}`);
    }

}