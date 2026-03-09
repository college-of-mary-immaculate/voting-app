import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = 'http://localhost:3000/api/candidates';

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}