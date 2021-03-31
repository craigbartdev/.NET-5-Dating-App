import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResetPassword } from '../_models/resetPassword';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  private _token: string;
  private _email: string;

  constructor(private accountService: AccountService, private fb: FormBuilder, private route: ActivatedRoute, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initializeForm();
    this._token = this.route.snapshot.queryParams['token'];
    this._email = this.route.snapshot.queryParams['email'];
  }

  initializeForm() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.maxLength(8), Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required, this.accountService.matchValues('password')]]
    })
  }

  resetPassword() {
    const resetPassword: ResetPassword = {
      password: this.resetPasswordForm.value["password"],
      confirmPassword: this.resetPasswordForm.value["confirmPassword"],
      token: this._token,
      email: this._email
    }
    
    this.accountService.resetPassword(resetPassword)
      .subscribe(res => {
        this.toastr.success("Your password has successfully been changed")
      },
      err => {
        this.toastr.error(err)
      })
  }
}
