import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChargeAndLimitConfig, FundTransferPayload,  TransactionLimit } from '../model/funs-transfer.model';
import { GlobalResponse ,UserPayload} from '../model/globar.model';
import { HttpParams } from '@angular/common/http';



@Injectable({
    providedIn: 'root'
})
export class FundTransferApiService {
    baseUrl = environment.managementConsoleApiBaseUrl;
    http = inject(HttpClient);


    updateFundTransferLimit(data: FundTransferPayload[]): Observable<GlobalResponse> {
        return this.http.post<GlobalResponse>(
            `${this.baseUrl}/api/Request/UpdateFundTrfPolicy`,
            data
        );
    }

    searchUser(payload: UserPayload): Observable<GlobalResponse> {

        const params = new HttpParams()
            .set('searchFlag', payload.searchFlag ?? '')
            .set('userId', payload.userId ?? '')
            .set('customerId', payload.customerId ?? '')
            .set('mobileNumber', payload.mobileNumber ?? '')
            .set('email', payload.email ?? 'undefined'); 

        return this.http.get<GlobalResponse>(
            `${this.baseUrl}/api/UserManagement/FindUserInformation`,
            { params }
        );
    }
    addNewFund(payload:TransactionLimit): Observable<GlobalResponse> {
        return this.http.post<GlobalResponse>(
            `${this.baseUrl}/api/Request/AddNewFundTrfPolicy`,
            payload
        );
    }

    updateGlobalFund(payload:ChargeAndLimitConfig): Observable<GlobalResponse> {
        return this.http.post<GlobalResponse>(
            `${this.baseUrl}/api/Request/UpdateGlobalFundTrfPolicy`,
            payload
        );
    }

}