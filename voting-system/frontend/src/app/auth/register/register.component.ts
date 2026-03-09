import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.user).subscribe({
      next: (res) => {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Registration failed');
      }
    });
  }
}