import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, _state) => {
  const auth      = inject(AuthService);
  const router    = inject(Router);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // During SSR, let the route through — the browser will handle auth redirect
  if (!isBrowser) return true;

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
