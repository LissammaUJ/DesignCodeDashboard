import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { CustomerSalesDto, DesignFilterRequest } from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class CustomerSalesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customer-sales`;

  getCustomerSales(filter: DesignFilterRequest): Observable<CustomerSalesDto[]> {
    const params = new HttpParams()
      .set('accountId', String(filter.customerAccountId))
      .set('startDate', toIsoDate(filter.startDate))
      .set('endDate', toIsoDate(filter.endDate));

    const url = `${this.baseUrl}?${params.toString()}`;
    console.info('[CustomerSalesApiService] API Request URL', url);

    return this.http
      .get<CustomerSalesDto[]>(this.baseUrl, { params })
      .pipe(catchError(handleApiError));
  }
}
