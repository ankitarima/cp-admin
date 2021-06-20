import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MockTestComponent } from './mock-test/mock-test.component';
import { MockComponent } from './mock/mock.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { NgxSummernoteModule } from 'ngx-summernote';
import { HttpClientModule } from '@angular/common/http';
import { CutOffComponent } from './cut-off/cut-off.component';
import { MockCategoryComponent } from './mock-category/mock-category.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ExamsComponent } from './exams/exams.component';
import { NgxTagsModule } from 'ngx-tags-input-box';
import { AuthComponent } from './auth/auth.component';
import { AngularFireAuthModule } from '@angular/fire/auth';

@NgModule({
  declarations: [
    AppComponent,
    MockTestComponent,
    MockComponent,
    ReviewsComponent,
    CutOffComponent,
    MockCategoryComponent,
    ExamsComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    HttpClientModule,
    QuillModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgxSummernoteModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxTagsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
