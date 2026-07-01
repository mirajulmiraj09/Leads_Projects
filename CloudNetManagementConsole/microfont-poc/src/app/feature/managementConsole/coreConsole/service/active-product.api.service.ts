import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { environment } from '../../../../../environments/environment';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import {ProductConstant} from '../constant/product.constant';
import { ProductPayload } from '../model/product.model';
import { GlobalResponse } from '../model/globar.model';


@Injectable({
  providedIn: 'root'
})
export class ActiveProductApiService {
  private baseUrl = environment.managementConsoleApiBaseUrl; // Replace with your actual API base URL
  http = inject(HttpClient);
  productConstant = new ProductConstant();
  


  getActiveProductsList(producttypeID: number): Observable<GlobalResponse> {

    const params = new HttpParams()
      .set('producttypeID', producttypeID.toString());

    return this.http.get<GlobalResponse>(
      `${this.baseUrl}${this.productConstant.GET_URL}`,
      { params }
    );
  }

 
  saveProduct(payload: ProductPayload): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${this.productConstant.SAVE_URL}`,
      payload
    );
  }


}