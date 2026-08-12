import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { AccountDetailDto, DesignInventoryDto, DesignProductionDto } from '../models/api.models';
import { handleApiError, toIsoDate } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class DesignTabsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/designs`;

  /** GET /api/designs/{designId}/production — SP rows only. */
  getProduction(designId: number): Observable<DesignProductionDto[]> {
    return this.http
      .get<DesignProductionDto[]>(`${this.baseUrl}/${designId}/production`)
      .pipe(catchError(handleApiError));
  }

  /** GET /api/designs/{designId}/inventory — never fabricate currentStock=0 on error. */
  getInventory(designId: number): Observable<DesignInventoryDto> {
    return this.http
      .get<DesignInventoryDto>(`${this.baseUrl}/${designId}/inventory`)
      .pipe(catchError(handleApiError));
  }

  /**
   * GET /api/designs/{productId}/other-customers — GetOtherCustomers SP action.
   * Excludes the selected account; filtered by selected date range.
   */
  getOtherCustomers(
    productId: number,
    accountId: number,
    startDate: string | Date,
    endDate: string | Date
  ): Observable<AccountDetailDto[]> {
    const params = new HttpParams()
      .set('accountId', String(accountId))
      .set('startDate', toIsoDate(startDate))
      .set('endDate', toIsoDate(endDate));

    return this.http
      .get<AccountDetailDto[]>(`${this.baseUrl}/${productId}/other-customers`, { params })
      .pipe(catchError(handleApiError));
  }
}
