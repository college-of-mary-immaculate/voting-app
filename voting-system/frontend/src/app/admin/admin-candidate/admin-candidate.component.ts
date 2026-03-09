import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-candidate.component.html',
  styleUrls: ['./admin-candidate.component.scss']
})
export class AdminCandidateComponent {
  candidates: any[] = [];
  newCandidate = { name: '', party: '' };

  constructor(private adminService: AdminService) {
    this.loadCandidates();
  }

  loadCandidates() {
    this.adminService.getCandidates().subscribe(res => (this.candidates = res));
  }

  addCandidate() {
    if (!this.newCandidate.name || !this.newCandidate.party) return;
    this.adminService.addCandidate(this.newCandidate).subscribe(() => {
      this.loadCandidates();
      this.newCandidate = { name: '', party: '' };
    });
  }

  deleteCandidate(id: number) {
    this.adminService.deleteCandidate(id).subscribe(() => this.loadCandidates());
  }
}