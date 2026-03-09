import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsService } from './results.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'] // create empty file if missing
})
export class ResultsComponent {
  results: any[] = [];

  constructor(private resultsService: ResultsService) {
    this.loadResults();
  }

  loadResults() {
    // provide electionId 1 for now
    this.resultsService.getResults(1).subscribe(res => {
      this.results = res;
    });
  }
}