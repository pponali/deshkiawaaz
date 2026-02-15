import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class CapacitorService {
  
  constructor() {}

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running in web browser, skipping native initialization');
      return;
    }

    console.log('Initializing Capacitor plugins...');
    
    try {
      // Initialize StatusBar
      await this.initStatusBar();
      
      // Initialize Keyboard
      await this.initKeyboard();
      
      // Initialize App listeners
      await this.initAppListeners();
      
      // Initialize Push Notifications
      await this.initPushNotifications();
      
      // Hide splash screen after initialization
      await SplashScreen.hide();
      
      console.log('Capacitor plugins initialized successfully');
    } catch (error) {
      console.error('Error initializing Capacitor plugins:', error);
    }
  }

  private async initStatusBar(): Promise<void> {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#FF5722' });
    } catch (error) {
      console.warn('StatusBar initialization failed:', error);
    }
  }

  private async initKeyboard(): Promise<void> {
    try {
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show with height:', info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
      });
    } catch (error) {
      console.warn('Keyboard initialization failed:', error);
    }
  }

  private async initAppListeners(): Promise<void> {
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
      });

      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    } catch (error) {
      console.warn('App listeners initialization failed:', error);
    }
  }

  private async initPushNotifications(): Promise<void> {
    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        
        // Add listeners
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token:', token.value);
          // Store or send token to your backend
          this.storePushToken(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push notification action performed:', action);
        });
      } else {
        console.log('Push notification permission not granted');
      }
    } catch (error) {
      console.warn('Push notifications initialization failed:', error);
    }
  }

  private storePushToken(token: string): void {
    // Store token locally or send to backend
    localStorage.setItem('pushToken', token);
    console.log('Push token stored:', token);
  }

  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }
}
