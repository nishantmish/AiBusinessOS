import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isAuthPublicUrl(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/refresh');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  let outgoing = req;
  if (token && !isAuthPublicUrl(req.url)) {
    outgoing = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthPublicUrl(req.url)) {
        return throwError(() => err);
      }

      return auth.refreshAccessToken().pipe(
        switchMap(() => {
          const nextToken = auth.getToken();
          if (!nextToken) {
            return throwError(() => err);
          }
          return next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${nextToken}` },
            })
          );
        }),
        catchError(() => {
          auth.logoutLocal();
          return throwError(() => err);
        })
      );
    })
  );
};
