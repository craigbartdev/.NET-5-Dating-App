import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaderResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { userInfo } from 'os';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(err => {
        if (err) {
          switch (err.status) {
            case 400:
              //validation errors
              if (err.error.errors) {
                const modelStateErrors = [];
                for (const key in err.error.errors) {
                  if (err.error.errors[key]) {
                    modelStateErrors.push(err.error.errors[key])
                  }
                }
                throw modelStateErrors.flat();
              } else if (typeof(err.error) === 'object') {
                this.toastr.error(err.statusText, err.status)
              } else {
                this.toastr.error(err.error, err.status);
              }
              break;
            case 401:
              this.toastr.error(err.statusText === "OK" ? "Unauthorized" : err.statusText, err.status);
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: err.error}};
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(err);
              break;
          }
        }
        //should never be reached
        return throwError(err);
      })
    );
  }
}
