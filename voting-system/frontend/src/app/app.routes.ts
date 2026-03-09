import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminCandidateComponent } from './admin/admin-candidate/admin-candidate.component';
import { VoteComponent } from './vote/vote.component';
import { ResultsComponent } from './results/results.component';
import { AuthGuard } from './shared/auth.guard';
import { AdminGuard } from './shared/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminCandidateComponent, canActivate: [AdminGuard] },
  { path: 'vote', component: VoteComponent, canActivate: [AuthGuard] },
  { path: 'results', component: ResultsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' },
];