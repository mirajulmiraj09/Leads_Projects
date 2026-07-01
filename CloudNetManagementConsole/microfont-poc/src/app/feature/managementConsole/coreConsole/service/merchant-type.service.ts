import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { GlobalResponse } from '../model/globar.model';
import { MerchantTypeModel } from '../model/merchant-type.model';
import { MerchantType } from '../../pages/merchant-type/merchant-type';

@Injectable({
    providedIn: 'root'
})
export class MerchantTypeApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.managementConsoleApiBaseUrl; 
    
    getMerchantTypes(): Observable<GlobalResponse> {
        return this.http.get<GlobalResponse>(`${this.baseUrl}/api/BenefitOrDiscount/GetBenefitOrDiscountTypes`);
    }
    
    addOrEditOrChangeStatusOfMerchantType(payload: MerchantTypeModel): Observable<GlobalResponse> {
        return this.http.post<GlobalResponse>(`${this.baseUrl}/api/BenefitOrDiscount/AddOrEditOrChangeStatusOfBenefitOrDiscountType`, payload);
    }
    getBenefitOrDiscountTypeDetails(): Observable<GlobalResponse> {
        return this.http.get<GlobalResponse>(`${this.baseUrl}/api/BenefitOrDiscount/GetBenefitOrDiscountTypes`);
    }
    
}