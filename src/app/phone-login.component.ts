import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-phone-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-md mx-auto mt-10 p-5 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold text-gray-800 mb-5">Phone Login</h2>
      <div *ngIf="message" class="text-blue-500 mb-3">{{ message }}</div>
      <div *ngIf="errorMessage" class="text-red-500 mb-3">{{ errorMessage }}</div>
      <form [formGroup]="phoneNumberForm" (ngSubmit)="submitPhoneNumber()">
        <div class="mb-4">
          <label for="phone" class="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
          <input type="tel" 
                 id="phone" 
                 formControlName="phone"
                 (input)="onPhoneNumberChange($event)"
                 placeholder="+91 9999999999"
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <button type="submit" 
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                [disabled]="phoneNumberForm.invalid">
          Send Verification Code
        </button>
      </form>
      <div id="recaptcha-container"></div>
    </div>
  `,
  styles: []
})
export class PhoneLoginComponent {
  phoneNumber = '';
  errorMessage = '';
  message = '';
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

  onPhoneNumberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.phoneNumber = target.value;
  }

  submitPhoneNumber(): void {
    if (this.phoneNumberForm.invalid) {
      this.message = 'Please enter a phone number.';
      return;
    }
    if (!this.phoneNumber) return;

    this.message = 'Sending verification code...';
    this.authService.sendVerificationCode(this.phoneNumber).subscribe({
      next: () => {
        this.errorMessage = '';
        this.message = 'Verification code sent successfully.';
        this.onPhoneNumberSubmitted.emit();
      },
      error: (error: Error) => {
        console.error('Error sending verification code:', error);
        this.errorMessage = error.message || 'Failed to send verification code.';
        this.message = '';
      }
    });
  }
}
