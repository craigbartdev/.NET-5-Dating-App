import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {
  showSuccess: boolean = false;
  showError: boolean = false;

  constructor(private accountService: AccountService, private route: ActivatedRoute, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.confirmEmail();
  }

  confirmEmail() {
    const token = this.route.snapshot.queryParams['token'];
    const email = this.route.snapshot.queryParams['email'];

    console.log(token);

    this.accountService.confirmEmail(token, email)
      .subscribe(res => {
        this.showSuccess = true;
        this.toastr.success("Please Log In", "Email Confirmed")
      },
      err => {
        this.showError = true;
        this.toastr.error(err)
      })
  }

}
