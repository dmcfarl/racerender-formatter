import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UploadFormatterStepComponent } from './steps/upload-formatter-step/upload-formatter-step.component';
import { ColumnsFormatterStepComponent } from './steps/columns-formatter-step/columns-formatter-step.component';
import { LapsFormatterStepComponent } from './steps/laps-formatter-step/laps-formatter-step.component';
import { DownloadFormatterStepComponent } from './steps/download-formatter-step/download-formatter-step.component';

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
