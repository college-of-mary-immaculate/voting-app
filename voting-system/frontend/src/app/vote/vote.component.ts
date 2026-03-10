import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoteService } from './vote.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'vote-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.scss'
})
export class VoteComponent implements OnInit {
  candidateId!: number;
  electionId = 1;
  isLoading = false;

  constructor(
    private voteService: VoteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.candidateId = +params['candidateId'];
    });
  }

  confirmVote() {
    if (!this.candidateId) {
      alert('Please select a candidate');
      return;
    }

    this.isLoading = true;
    this.voteService.vote(this.candidateId, this.electionId).subscribe({
      next: (res) => {
        alert(res.message || 'Vote submitted successfully!');
        this.router.navigate(['/results']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit vote');
        this.isLoading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/candidates']);
  }
}