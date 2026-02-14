import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier | null = null;
  private confirmationResult: firebase.auth.ConfirmationResult | null = null;

  constructor(private afAuth: AngularFireAuth, private dataService: DataService) {}

  getCurrentUser(): Observable<User | null> {
    return this.afAuth.authState.pipe(
      switchMap((firebaseUser) => {
        if (firebaseUser) {
          return this.dataService.getUser(firebaseUser.uid).pipe(
            map((user) => user || null)
          );
        }
        return of(null);
      })
    );
  }

  private initRecaptcha(): void {
    // Clear existing recaptcha if any
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    
    // Clear the container
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }

    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        this.initRecaptcha();
      }
    });
  }

  sendVerificationCode(phoneNumber: string): Observable<void> {
    this.initRecaptcha();
    
    if (!this.recaptchaVerifier) {
      return throwError(() => new Error('Failed to initialize reCAPTCHA'));
    }

    return from(this.afAuth.signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier)).pipe(
      map((result) => {
        this.confirmationResult = result;
        console.log('Verification code sent successfully');
      }),
      catchError((error: { code?: string; message?: string }) => {
        console.error('Error sending verification code:', error);
        let errorMessage = 'Failed to send verification code.';
        if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'Invalid phone number format. Use +91XXXXXXXXXX';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  confirmVerificationCode(code: string): Observable<User> {
    if (!this.confirmationResult) {
      return throwError(() => new Error('No verification in progress. Please request a new code.'));
    }

    return from(this.confirmationResult.confirm(code)).pipe(
      switchMap((userCredential: firebase.auth.UserCredential) => {
        const userUid = userCredential.user?.uid;
        const phoneNumber = userCredential.user?.phoneNumber || '';
        
        if (!userUid) {
          return throwError(() => new Error('User UID not found after authentication.'));
        }
        
        return this.dataService.getUser(userUid).pipe(
          switchMap((existingUser) => {
            if (existingUser) {
              return of(existingUser);
            } else {
              const newUser: User = {
                uid: userUid,
                phoneNumber: phoneNumber,
              };
              return this.dataService.createUser(newUser);
            }
          })
        );
      }),
      catchError((error: Error) => {
        console.error('Error confirming verification code:', error);
        return throwError(() => new Error('Invalid verification code.'));
      })
    );
  }

  getConfirmationResult(): firebase.auth.ConfirmationResult | null {
    return this.confirmationResult;
  }
}
