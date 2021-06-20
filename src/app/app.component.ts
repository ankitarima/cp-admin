import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public isAuth = false as any;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ){

  }

  ngOnInit(){
    if(localStorage.getItem('user')){
      this.isAuth = true
    }
  }

  logout(){
    this.afAuth.signOut()
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
