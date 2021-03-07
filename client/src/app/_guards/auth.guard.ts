import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Tokens } from '../_models/tokens';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private accountService: AccountService, private toastr: ToastrService, private router: Router) {}

  // canActivate(): Observable<boolean> {
  //   return this.accountService.currentUser$.pipe(
  //     map(user => {
  //       if (user) return true;
  //       // if there is no user in service
  //       this.toastr.error("You shall not pass!");
  //     })
  //   )
  // }

  // canActivate() : boolean {
  //   const jwtHelper = new JwtHelperService();
  //   let isRefreshSuccess: boolean;

  //   this.accountService.currentUser$.pipe(
  //     map(user => {
  //       console.log(user);
  //       if (user.token && !jwtHelper.isTokenExpired(user.token)) {
  //         console.log("User has valid token");
  //         return true;
  //       }

  //       else if (!user.token || !user.refreshToken) {
  //         console.log("User is missing a token")
  //         // this.logoutUser();
  //       }

  //       const tokens: Tokens = { accessToken: user.token, refreshToken: user.refreshToken};
        
  //       try {
  //         this.accountService.refresh(tokens).subscribe(res => {
  //           isRefreshSuccess = true;
  //         });
  //       } catch (ex) {
  //         isRefreshSuccess = false;
  //       }

  //       if (!isRefreshSuccess) {
  //         console.log("refresh failed");
  //         // this.logoutUser();
  //       } else {
  //         console.log("refresh succeeded");
  //       }
  //     })
  //   )

  //   return isRefreshSuccess;
  // }

  async canActivate() : Promise<boolean> {
    const jwtHelper = new JwtHelperService();
    let currentUser: User;
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        currentUser = user
      }
    });

    if (!currentUser) {
      this.router.navigateByUrl('/');
      this.toastr.error("You shall not pass!");
      return false;
    }

    if (!!currentUser.token && !jwtHelper.isTokenExpired(currentUser.token)) {
      // console.log(jwtHelper.decodeToken(currentUser.token));
      return true;
    }

    const isRefreshSuccess = await this.tryRefreshingTokens(currentUser);
    if (!isRefreshSuccess) {
      this.accountService.logout();
      this.router.navigateByUrl('/');
      this.toastr.error("Could not refresh token");
    }
    
    return isRefreshSuccess;
  }

  private async tryRefreshingTokens(user: User) : Promise<boolean> {
    const accessToken = user.token;
    const refreshToken = user.refreshToken;

    if (!user.token || !user.refreshToken) {
      return false;
    }

    let isRefreshSuccess: boolean;

    const tokens: Tokens = { accessToken, refreshToken};

    try {
      this.accountService.refresh(tokens).toPromise();
      isRefreshSuccess = true;
    } catch (ex) {
      isRefreshSuccess = false;
      console.log(ex);
    }

    return isRefreshSuccess;
  }
  
}
