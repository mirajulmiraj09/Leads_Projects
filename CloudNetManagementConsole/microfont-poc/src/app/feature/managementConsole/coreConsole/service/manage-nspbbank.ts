import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { inject } from '@angular/core';
import { GlobalResponse } from '../model/globar.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ManageNPSBBankService {
    private http = inject(HttpClient);
    private apiUrl = environment.managementConsoleApiBaseUrl;

    getAllNPSBBankData(): Observable<GlobalResponse> {
        return this.http.get<GlobalResponse>(`${this.apiUrl}/api/CombinedFeatures/GetAllNPSBBank`);
    }

    bankStateChange(bankID: string, state: boolean): Observable<GlobalResponse> {
        const url = `${this.apiUrl}/api/CombinedFeatures/ManageNPSBBank`;

        let params = new HttpParams()
            .set('npsbBankId', bankID)
            .set('isEnabled', state.toString());

        return this.http.post<GlobalResponse>(url, {}, { params });
    }


}
