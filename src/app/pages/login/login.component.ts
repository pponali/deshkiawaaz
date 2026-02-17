import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneLoginComponent } from '../../phone-login.component';
import { VerificationCodeComponent } from '../../verification-code.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, PhoneLoginComponent, VerificationCodeComponent],
  template: `
    <div class="w-full py-4 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800">DeshKiAwaaz</h1>
        <p class="text-gray-600 mt-2">Voice of the Nation</p>
      </div>
      <div class="bg-white p-8 rounded-lg shadow-md">
        @if (authStep === 'phone') {
          <app-phone-login (onPhoneNumberSubmitted)="onPhoneNumberSubmitted()"></app-phone-login>
        } @else {
          <app-verification-code (onCodeVerified)="onCodeVerified()"></app-verification-code>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  authStep: 'phone' | 'verification' = 'phone';

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService
  ) {}

  onPhoneNumberSubmitted(): void {
    this.authStep = 'verification';
  }

  onCodeVerified(): void {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.router.navigate(['/home']);
      }
    });
  }
}
