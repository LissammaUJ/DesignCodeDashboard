import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import {
  DesignActivityItemDto,
  DesignInventoryDto,
  DesignProductionDto,
} from '../models/api.models';

const emptyProduction = (): DesignProductionDto => ({
  productionQuantity: 0,
  completedQuantity: 0,
  pendingQuantity: 0,
  rejectedQuantity: 0,
  productionDate: null,
  department: '',
  machine: '',
  supervisor: '',
});

const emptyInventory = (): DesignInventoryDto => ({
  currentStock: 0,
  reservedStock: 0,
  availableStock: 0,
  pendingStock: 0,
  warehouse: '',
  rack: '',
  location: '',
  batchNumber: '',
});

@Injectable({ providedIn: 'root' })
export class DesignTabsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/designs`;

  getProduction(designId: number): Observable<DesignProductionDto> {
    return this.http
      .get<DesignProductionDto>(`${this.baseUrl}/${designId}/production`)
      .pipe(catchError(() => of(emptyProduction())));
  }

  getInventory(designId: number): Observable<DesignInventoryDto> {
    return this.http
      .get<DesignInventoryDto>(`${this.baseUrl}/${designId}/inventory`)
      .pipe(catchError(() => of(emptyInventory())));
  }

  getActivityTimeline(designId: number): Observable<DesignActivityItemDto[]> {
    return this.http
      .get<DesignActivityItemDto[]>(`${this.baseUrl}/${designId}/activity-timeline`)
      .pipe(catchError(() => of([])));
  }
}
