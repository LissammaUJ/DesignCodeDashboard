import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { CustomerDto } from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customer`;

  /**
   * Loads customers for the selected bill date range.
   * Always sends startDate/endDate as yyyy-MM-dd. Never calls /api/customer bare.
   */
  getCustomers(startDate: string | Date, endDate: string | Date): Observable<CustomerDto[]> {
    let start: string;
    let end: string;
    try {
      start = toIsoDate(startDate);
      end = toIsoDate(endDate);
    } catch {
      console.warn('[CustomerApi] Skipped GET /api/customer — invalid startDate/endDate');
      return of([]);
    }

    if (!start || !end) {
      console.warn('[CustomerApi] Skipped GET /api/customer — missing startDate/endDate');
      return of([]);
    }

    const params = new HttpParams().set('startDate', start).set('endDate', end);

    return this.http
      .get<CustomerDto[]>(this.baseUrl, { params })
      .pipe(catchError(handleApiError));
  }
}
