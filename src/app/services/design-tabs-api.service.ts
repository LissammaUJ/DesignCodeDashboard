import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { DesignInventoryDto, DesignProductionDto } from '../models/api.models';
import { handleApiError } from '../shared/api.utils';

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
}
