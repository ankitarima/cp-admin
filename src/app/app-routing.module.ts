import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { CutOffComponent } from './cut-off/cut-off.component';
import { ExamsComponent } from './exams/exams.component';
import { MockCategoryComponent } from './mock-category/mock-category.component';
import { MockTestComponent } from './mock-test/mock-test.component';
import { MockComponent } from './mock/mock.component';
import { ReviewsComponent } from './reviews/reviews.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent
  },
  {
    path:'questions',
    component: MockTestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'mock-test',
    component: MockComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'mock-category',
    component: MockCategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'review',
    component: ReviewsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cut-off',
    component: CutOffComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam',
    component: ExamsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
