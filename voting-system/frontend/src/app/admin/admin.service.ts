import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates`);
  }

  addCandidate(candidate: { name: string; party: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/candidates`, candidate);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/candidates/${id}`);
  }
}