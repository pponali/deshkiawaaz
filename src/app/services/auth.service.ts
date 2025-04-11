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
  constructor(private afAuth: AngularFireAuth, private dataService: DataService) {
  }

  sendVerificationCode(phoneNumber: string): Observable<void> {
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    });

    return of(null).pipe(
      switchMap(() => this.afAuth.signInWithPhoneNumber(phoneNumber, appVerifier)),
      map((confirmationResult) => {
        // You might want to store the confirmationResult for later use
        // For example, in a component's state
        console.log('Verification code sent successfully.');
        return;
      }),
      catchError((error) => {
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


  confirmVerificationCode(code: string, confirmationResult: any, phoneNumber: string): Observable<User> {
    return from(confirmationResult.confirm(code)).pipe(
      switchMap((userCredential) => {
        const userUid = userCredential.user?.uid;
        if (!userUid) {
          return throwError(() => new Error('User UID not found after authentication.'));
        }
        return this.dataService.getUser(phoneNumber).pipe(
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
      }), catchError((error) => {
        console.error('Error confirming verification code:', error);
        return throwError(() => new Error('Invalid verification code.'));
      })
    );
  }

}