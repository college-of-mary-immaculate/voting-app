import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private apiUrl = 'http://localhost:3000/api/vote';

  constructor(private http: HttpClient) {}

  vote(candidate_id: number, election_id: number): Observable<any> {
    return this.http.post(this.apiUrl, { candidate_id, election_id });
  }
}