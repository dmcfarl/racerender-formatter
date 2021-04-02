import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UploadStepComponent } from './steps/upload-step/upload-step.component';



const appRoutes: Routes = [
  { path: 'upload-step', component: UploadStepComponent },
  { path: 'columns-step', component: UploadStepComponent },
  { path: 'laps-step', component: UploadStepComponent },
  { path: 'download-step', component: UploadStepComponent },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    CommonModule
  ],
  exports: [
    RouterModule
  ]
})
export class StepRoutingModule { }
