import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UploadStepComponent } from './steps/upload-step/upload-step.component';
import { ColumnsStepComponent } from './steps/columns-step/columns-step.component';
import { LapsStepComponent } from './steps/laps-step/laps-step.component';
import { DownloadStepComponent } from './steps/download-step/download-step.component';

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
