import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GlobalResponse ,UserPayload} from '../model/globar.model';
import { HttpParams } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class ResetTPinApiSErvice {
    http = inject(HttpClient);
    baseUrl = environment.managementConsoleApiBaseUrl;

    getUser(payload: UserPayload): Observable<GlobalResponse> {
        const params = {
            searchFlag: payload.searchFlag,
            userId: payload.userId ? payload.userId : '',
            customerId: payload.customerId ? payload.customerId : '',
            mobileNumber: payload.mobileNumber ? payload.mobileNumber : '',
            email: payload.email ? payload.email : ''
        };
        return this.http.get<GlobalResponse>(
            `${this.baseUrl}/api/UserManagement/FindUserInformation`,
            { params }
        );
    }

   
getResetTPin(UserID: string): Observable<GlobalResponse> {

  const params = new HttpParams().set('UserID', UserID);

  return this.http.post<GlobalResponse>(
    'http://192.168.20.218/CloudNetManagementAPI/api/Request/ResetTPIN',
    {},               
    { params }        
  );
}



}