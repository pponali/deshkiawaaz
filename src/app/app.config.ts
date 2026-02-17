import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { environment } from '../environments/environment';
import { ErrorService } from './services/error.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

// Firebase compat imports (for AngularFireAuth and AngularFirestore in auth.service and data.service)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// Firebase modular imports (for task.service which uses modular API)
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: ErrorService },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Compat modules (for auth.service.ts and data.service.ts)
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule,
      AngularFirestoreModule
    ),

    // Modular providers (for task.service.ts)
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() =>
      initializeFirestore(getApp(), {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      })
    ),

    provideAnimationsAsync(),
  ],
};
