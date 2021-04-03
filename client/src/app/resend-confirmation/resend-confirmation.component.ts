import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-resend-confirmation',
  templateUrl: './resend-confirmation.component.html',
  styleUrls: ['./resend-confirmation.component.css']
})
export class ResendConfirmationComponent implements OnInit {
  resendEmailForm: FormGroup;

  constructor(private accountService: AccountService, private toastr: ToastrService, 
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.resendEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  resendEmail() {
    const formValue = {...this.resendEmailForm.value}
    this.accountService.resendConfirmation(formValue.email)
      .subscribe(res => {
        this.toastr.success('The link has been sent, please check your inbox')
      },
      err => {
        this.toastr.error(err)
      })
  }

}
