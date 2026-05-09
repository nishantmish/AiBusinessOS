import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead } from '../models';
import { AuthService } from './auth.service';

export interface LeadDto {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  valueEstimate: number;
  score: number;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

const SOURCE_ALIASES: Lead['source'][] = [
  'WhatsApp',
  'Form',
  'Manual',
  'Referral',
  'Instagram',
  'Google',
];

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly base = `${environment.apiBaseUrl}/v1.0/leads`;

  readonly leads = signal<Lead[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal(0);

  private normalizeSource(raw: string): Lead['source'] {
    const match = SOURCE_ALIASES.find(s => s.toLowerCase() === raw.toLowerCase());
    return match ?? 'Manual';
  }

  private mapStatusToStage(status: string): Lead['stage'] {
    const s = status.toLowerCase();
    if (s === 'won') return 'won';
    if (s === 'lost') return 'lost';
    return 'new';
  }

  private mapDtoToLead(row: LeadDto): Lead {
    const orgId = this.auth.getUser()?.organizationId ?? '';
    const name = [row.firstName, row.lastName ?? ''].filter(Boolean).join(' ').trim() || '—';
    const stage = this.mapStatusToStage(row.status);
    const st: Lead['status'] =
      row.status.toLowerCase() === 'won' ? 'won' : row.status.toLowerCase() === 'lost' ? 'lost' : 'open';

    return {
      id: row.id,
      orgId,
      name,
      email: row.email ?? '',
      phone: row.phone ?? '',
      source: this.normalizeSource(row.source || 'Manual'),
      stage,
      score: row.score,
      status: st,
      owner: '—',
      ownerId: '',
      value: Number(row.valueEstimate),
      tags: [],
      notes: '',
      createdAt: row.createdAt.slice(0, 10),
      updatedAt: row.createdAt.slice(0, 10),
    };
  }

  loadLeads(options?: { search?: string; status?: string; page?: number; pageSize?: number }): Observable<Lead[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('pageNumber', String(options?.page ?? 1))
      .set('pageSize', String(options?.pageSize ?? 100));

    if (options?.search) {
      params = params.set('search', options.search);
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }

    return this.http.get<PagedResult<LeadDto>>(this.base, { params }).pipe(
      map(res => {
        const mapped = (res.items ?? []).map(i => this.mapDtoToLead(i));
        this.leads.set(mapped);
        this.totalCount.set(res.totalCount ?? mapped.length);
        this.loading.set(false);
        return mapped;
      }),
      catchError(err => {
        const msg = err.error?.message || err.message || 'Failed to load leads';
        this.error.set(msg);
        this.loading.set(false);
        this.leads.set([]);
        return of([]);
      })
    );
  }

  createLead(body: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    source: string;
    companyName?: string;
  }): Observable<{ id: string }> {
    this.error.set(null);
    return this.http.post<{ id: string }>(this.base, body).pipe(
      tap(() => {
        this.loadLeads().subscribe();
      }),
      catchError(err => {
        const msg = err.error?.message || err.message || 'Failed to create lead';
        this.error.set(msg);
        return throwError(() => err);
      })
    );
  }
}
