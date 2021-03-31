import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaderResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { Tokens } from '../_models/tokens';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  // allows handle401Error method to tell whether it needs to call refresh method
  // or get the access token from the refreshTokenSubject
  private isRefreshing = false;
  // holds an access token not a refresh token
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private accountService: AccountService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let currentUser: User;

    this.accountService.currentUser$.pipe(take(1)).subscribe(user => currentUser = user);

    if (!!currentUser) {
      request = this.addToken(request, currentUser.token);
    }

    return next.handle(request).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // console.log("logging 401 response");
          return this.handle401Error(request, next, currentUser);
        } else {
          return throwError(err);
        }
      })
    )
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, user: User) {

    if (user == null) {
      return next.handle(request);
    }

    const tokens: Tokens = {accessToken: user.token, refreshToken: user.refreshToken}
    
    // call refresh method to get a new access token
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.accountService.refresh(tokens).pipe(
        switchMap((tokens: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokens.accessToken);
          return next.handle(this.addToken(request, tokens.accessToken));
        })
      )
    } else {
      // get access token from the subject
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      )
    }
  }
}