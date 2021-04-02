import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UploadStepComponent } from './steps/upload-step/upload-step.component';
import { ColumnsStepComponent } from './steps/columns-step/columns-step.component';
import { LapsStepComponent } from './steps/laps-step/laps-step.component';
import { DownloadStepComponent } from './steps/download-step/download-step.component';



const appRoutes: Routes = [
  { path: 'upload-step', component: UploadStepComponent },
  { path: 'columns-step', component: ColumnsStepComponent },
  { path: 'laps-step', component: LapsStepComponent },
  { path: 'download-step', component: DownloadStepComponent },
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
