import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { DesignDetailDto, DesignFilterRequest } from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class DesignApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/design`;

  getDesignById(
    designId: number,
    filter?: Partial<DesignFilterRequest>
  ): Observable<DesignDetailDto> {
    let params = new HttpParams();

    if (filter?.customerAccountId != null) {
      params = params
        .set('accountId', filter.customerAccountId)
        .set('customerAccountId', filter.customerAccountId);
    }
    if (filter?.startDate) {
      params = params.set('startDate', toIsoDate(filter.startDate));
    }
    if (filter?.endDate) {
      params = params.set('endDate', toIsoDate(filter.endDate));
    }

    return this.http
      .get<DesignDetailDto>(`${this.baseUrl}/${designId}`, { params })
      .pipe(catchError(handleApiError));
  }
}
