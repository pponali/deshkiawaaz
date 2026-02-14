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

  sendVerificationCode(phoneNumber: string): Observable<firebase.auth.ConfirmationResult> {
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
    });

    return from(this.afAuth.signInWithPhoneNumber(phoneNumber, appVerifier)).pipe(
      catchError((error: { code?: string }) => {
        console.error('Error sending verification code:', error);
        let errorMessage = 'Failed to send verification code.';
        if (error.code === 'auth/invalid-phone-number') {
          errorMessage = 'Invalid phone number format.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  confirmVerificationCode(code: string, confirmationResult: firebase.auth.ConfirmationResult, phoneNumber: string): Observable<User> {
    return from(confirmationResult.confirm(code)).pipe(
      switchMap((userCredential: firebase.auth.UserCredential) => {
        const userUid = userCredential.user?.uid;
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
}
