import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { CustomerDto } from '../models/api.models';
import { handleApiError } from '../shared/api.utils';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customer`;

  getCustomers(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(this.baseUrl).pipe(catchError(handleApiError));
  }
}
