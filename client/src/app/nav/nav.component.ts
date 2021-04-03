import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = { }


  constructor(public accountService: AccountService,
    private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  login() {
    this.accountService.login(this.model).subscribe(res => {
      this.router.navigateByUrl('/members')
    }, err => {
      if (err.error === "Email has not been confirmed") {
        this.toastr.info("Click here to resend confirmation email", "Resend Email")
          .onTap.subscribe(() => { this.router.navigateByUrl('/resendConfirmation') });
      }
    })
  }

  logout() {
    this.accountService.logout()
    this.router.navigateByUrl('/')
  }
}
