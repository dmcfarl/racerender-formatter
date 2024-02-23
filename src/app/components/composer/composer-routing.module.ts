import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const formatterRoutes: Routes = [
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(
      formatterRoutes,
      { enableTracing: false }
    ),
    CommonModule
  ],
  exports: [
    RouterModule
  ]
})
export class FormatterRoutingModule {

}
