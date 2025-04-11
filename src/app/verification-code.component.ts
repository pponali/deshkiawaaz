import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-verification-code',
  templateUrl: './verification-code.component.html',
  styleUrls: ['./verification-code.component.scss'],
})
export class VerificationCodeComponent {
  otpControl = new FormControl('');
  loading: boolean = false;
  errorMessage: string = '';
  @Output() onCodeVerified = new EventEmitter<any>();
  constructor(private authService: AuthService) {}
  verifyCode(confirmationResult: any, phoneNumber: string) {
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
            next: (user) => {
                this.errorMessage = '';
                this.loading = false;                
                this.onCodeVerified.emit(confirmationResult); // Emit confirmationResult
            },
            error: (error: any) => {
                this.loading = false;
                this.errorMessage = 'Verification failed. Please check the code and try again.';
            }
        });
    }

    onOtpChange() {
        if (this.otpControl.value?.length === 6) {}
            // Implement automatic verification here.        
    }
}