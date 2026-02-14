import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-verification-code',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './verification-code.component.html',
  styles: []
})
export class VerificationCodeComponent {
  otpControl = new FormControl('');
  loading = false;
  errorMessage = '';
  successMessage = '';
  verificationCode = '';

  @Output() onCodeVerified = new EventEmitter<any>();

  constructor(private authService: AuthService) {}

  verifyCode(confirmationResult: any, phoneNumber: string): void {
    const code = this.otpControl.value;
    if (!code) {
      this.errorMessage = 'Code is required.';
      return;
    }
    if (code.length !== 6) {
      this.errorMessage = 'Code must be 6 digits.';
      return;
    }
    this.errorMessage = '';
    this.loading = true;

    this.authService.confirmVerificationCode(code, confirmationResult, phoneNumber).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = 'Verification successful!';
        this.loading = false;
        this.onCodeVerified.emit(confirmationResult);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Verification failed. Please check the code and try again.';
      }
    });
  }

  onOtpChange(): void {
    // Auto-verify when 6 digits entered
    if (this.otpControl.value?.length === 6) {
      // Could implement auto-verification here
    }
  }
}
