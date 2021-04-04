import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  registerMode = false;
  // users: any;

  constructor(/*private http: HttpClient*/ private accountService: AccountService, private router: Router) { }

  ngOnInit(): void {
    // this.getUsers()
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigateByUrl('/members')
      }
    })
  }

  registerToggle() {
    this.registerMode = !this.registerMode
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }
}
