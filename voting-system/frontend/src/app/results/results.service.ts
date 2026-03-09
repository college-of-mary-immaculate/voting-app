import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getResults(electionId: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/results/${electionId}`);
  }
}