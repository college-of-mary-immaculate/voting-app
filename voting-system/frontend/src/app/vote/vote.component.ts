import { Component, OnInit } from '@angular/core';
import { VoteService } from './vote.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'vote-page',
  standalone: true,
  template: `
    <h2>Vote Confirmation</h2>
    <button (click)="confirmVote()">Confirm Vote</button>
  `
})
export class VoteComponent implements OnInit {
  candidateId!: number;
  electionId = 1;

  constructor(private voteService: VoteService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.candidateId = +params['candidateId']);
  }

  confirmVote() {
    this.voteService.vote(this.candidateId, this.electionId).subscribe({
      next: (res) => {
        alert(res.message);
        this.router.navigate(['/results']);
      },
      error: (err) => alert(err.error.message)
    });
  }
}