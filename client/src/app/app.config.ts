/**
 * Application-level providers and configuration.
 *
 * Why provideRouter with withComponentInputBinding?
 * Component input binding lets us receive route params as @Input() properties
 * instead of injecting ActivatedRoute. Cleaner code, less boilerplate.
 *
 * Why withInMemoryScrolling?
 * Default Angular behavior leaves scroll position unchanged across navigation,
 * which feels broken to users coming from MPA sites. We restore scroll on
 * back/forward and scroll to top on new navigations.
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions(),
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
  ],
};
