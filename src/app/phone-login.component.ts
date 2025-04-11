import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-phone-login',
  standalone: true,
  imports: [NgxIntlTelInputModule, FormsModule, ReactiveFormsModule],
  template: `
    <p>phone-login works!</p>
  `,
  styles: [],
})
export class PhoneLoginComponent {
  phoneNumber: string = '';
  errorMessage: string = '';
  message: string = '';
  phoneNumberForm: FormGroup;
  @Output() onPhoneNumberSubmitted = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.phoneNumberForm = this.formBuilder.group({
      phone: ['', Validators.required],
    });
  }

  onPhoneNumberChange(event: any) {
    this.phoneNumber = event;
  }

  submitPhoneNumber() {
    if (this.phoneNumberForm.invalid) {
      this.message = 'Please enter a phone number.';
      return;
    } 
    if (!this.phoneNumber) return;

        this.message = 'Sending verification code...';
        this.authService.sendVerificationCode(this.phoneNumber)
          .subscribe({
            next: () => {
              this.errorMessage = '';
              this.message = 'Verification code sent successfully.';
              this.onPhoneNumberSubmitted.emit();
              // You might want to navigate to the verification code input component here
            },
            error: (error: any) => {
              console.error('Error sending verification code:', error);
              if (error.message === 'auth/invalid-phone-number') {
                this.errorMessage = 'Invalid phone number format.';
              } else if (error.message === 'auth/too-many-requests') {
                this.errorMessage = 'Too many requests. Please try again later.';
              } else {
                this.errorMessage = 'Failed to send verification code.';
              }
              // Handle specific errors (e.g., invalid phone number) if needed
            }
          });
  }
}