import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { DesignFilterRequest, DesignListItemDto } from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class DesignsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/designs`;

  getDesigns(filter: DesignFilterRequest): Observable<DesignListItemDto[]> {
    const params = new HttpParams()
      .set('accountId', String(filter.customerAccountId))
      .set('customerAccountId', String(filter.customerAccountId))
      .set('startDate', toIsoDate(filter.startDate))
      .set('endDate', toIsoDate(filter.endDate));

    const url = `${this.baseUrl}?${params.toString()}`;
    console.info('[DesignsApiService]', url);

    return this.http
      .get<DesignListItemDto[]>(this.baseUrl, { params })
      .pipe(catchError(handleApiError));
  }
}
