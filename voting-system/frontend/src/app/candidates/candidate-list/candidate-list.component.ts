import { Component, OnInit, signal } from '@angular/core';
import { CandidateService } from '../candidate.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'candidate-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.scss']
})
export class CandidateListComponent implements OnInit {
  candidates = signal<any[]>([]);

  constructor(private candidateService: CandidateService, private router: Router) {}

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.candidateService.getCandidates().subscribe({
      next: (data) => this.candidates.set(data),
      error: (err) => console.error(err)
    });
  }

  vote(candidateId: number) {
    this.router.navigate(['/vote'], { queryParams: { candidateId } });
  }
}