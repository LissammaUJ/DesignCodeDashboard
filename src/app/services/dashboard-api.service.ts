import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DashboardChartsDto,
  DashboardSummaryDto,
  DesignFilterRequest,
} from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  getSummary(filter: DesignFilterRequest): Observable<DashboardSummaryDto> {
    return this.http
      .get<DashboardSummaryDto>(`${this.baseUrl}/summary`, { params: this.toParams(filter) })
      .pipe(catchError(handleApiError));
  }

  getCharts(filter: DesignFilterRequest): Observable<DashboardChartsDto> {
    return this.http
      .get<DashboardChartsDto>(`${this.baseUrl}/charts`, { params: this.toParams(filter) })
      .pipe(catchError(handleApiError));
  }

  private toParams(filter: DesignFilterRequest): HttpParams {
    return new HttpParams()
      .set('accountId', filter.customerAccountId)
      .set('customerAccountId', filter.customerAccountId)
      .set('startDate', toIsoDate(filter.startDate))
      .set('endDate', toIsoDate(filter.endDate));
  }
}
