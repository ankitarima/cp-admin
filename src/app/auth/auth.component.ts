import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  public loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators['required'])
  })

  public userdata:any;
  public isloading = false as any;
  public message:any

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {
  }

  login(){
    this.isloading = true;
    this.afAuth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password).then((resp)=>{
      const uid = resp.user?.uid;
      console.log(uid)
      this.db.collection('admin_users').ref.where('uid','==', uid).get().then((resp)=>{
        resp.forEach((user)=>{
          console.log(user.data());
          this.userdata = user.data()
        })
      }).then(()=>{
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify(this.userdata));
        this.message = "You are now authorised !  ✅ "
        this.loginForm.reset();
        this.isloading = false;
      })
    }).catch((err)=>{
      this.message = err;
      this.isloading = false;
    })
  }

}
