import  {Injectable} from '@angular/core';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {GlobalResponse,UserPayload} from '../model/globar.model';
import { NotificationRequest} from '../model/notification.model';


@Injectable({
     providedIn: 'root'
})
export class NotificationApiService {
    http = inject(HttpClient);
    baseUrl = "miraj";

    getUser(payload: UserPayload): Observable<GlobalResponse> {
        const params = {
            searchFlag: payload.searchFlag,
            userId: payload.userId? payload.userId : '',
            customerId: payload.customerId? payload.customerId : '',
            mobileNumber: payload.mobileNumber? payload.mobileNumber : '',
            email: payload.email? payload.email : ''
        };
        return this.http.get<GlobalResponse>(
            `${this.baseUrl}/api/UserManagement/FindUserInformation`,
            { params }
        );
    }
    createNotification(payload: NotificationRequest): Observable<GlobalResponse> {
        return this.http.post<GlobalResponse>(
            `${this.baseUrl}/api/CombinedFeatures/CreateNotification`,
            payload
        );
    }

}