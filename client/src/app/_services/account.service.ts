import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ForgotPassword } from '../_models/forgotPassword';
import { Register } from '../_models/register';
import { ResetPassword } from '../_models/resetPassword';
import { Tokens } from '../_models/tokens';
import { User } from '../_models/user';
import { CustomEncoder } from './customEncoder';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private presence: PresenceService) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((res: User) => {
        const user = res;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
        }
      })
    )
  }

  register(model: Register) {
    // set the client uri for email confirmation
    // model.clientURI = "https://localhost:4200/emailConfirmation";
    model.clientURI = location.origin + '/emailConfirmation';
    return this.http.post(this.baseUrl + 'account/register', model);
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]))
  }

  refresh(tokens: Tokens) {
    return this.http.post(this.baseUrl + 'token/refresh', tokens).pipe(
      // tap allows us to pipe and map in the jwt interceptor as well
      tap((tokens: Tokens) => {
        if (tokens) {
          this.currentUser$.pipe(take(1)).subscribe(user => {
            user.token = tokens.accessToken;
            user.refreshToken = tokens.refreshToken;
            this.setCurrentUser(user);
          })
        }
      })
    )
  }

  forgotPassword(email: string) {
    const body: ForgotPassword =  { email, clientURI: location.origin + '/resetpassword' }
    return this.http.post(this.baseUrl + 'account/forgotpassword', body);
  }

  resetPassword(body: ResetPassword) {
    return this.http.post(this.baseUrl + 'account/resetpassword', body);
  }

  confirmEmail(token: string, email: string) {
    let params = new HttpParams({ encoder: new CustomEncoder() })
    params = params.append('token', token);
    params = params.append('email', email);
    return this.http.get(this.baseUrl + 'account/emailconfirmation', { params })
  }

  // for confirming password in register and reset-password
  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value ? null : {isMatching: true}
    }
  }
}
