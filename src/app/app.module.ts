import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragndropDirective } from './directives/dragndrop.directive';
import { ProgressComponent } from './components/progress/progress.component';
import { ExtractorDirective } from './directives/extractor.directive';
import { MultistepFormComponent } from './components/multistep-form/multistep-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepMenuComponent } from './components/step-menu/step-menu.component';
import { UploadStepComponent } from './components/step-menu/steps/upload-step/upload-step.component';
import {StepsModule} from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { StepRoutingModule } from './components/step-menu/step-routing.module';
import { LapReaderService } from './components/multistep-form/reader/lapreader.service';
import { CSVReaderService } from './components/multistep-form/reader/csvreader.service';
import { RouterOutlet } from '@angular/router';
import { ColumnsStepComponent } from './components/step-menu/steps/columns-step/columns-step.component';
import { LapsStepComponent } from './components/step-menu/steps/laps-step/laps-step.component';
import { DownloadStepComponent } from './components/step-menu/steps/download-step/download-step.component';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {CheckboxModule} from 'primeng/checkbox';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';

@NgModule({
  declarations: [
    AppComponent,
    DragndropDirective,
    ProgressComponent,
    ExtractorDirective,
    MultistepFormComponent,
    StepMenuComponent,
    UploadStepComponent,
    ColumnsStepComponent,
    LapsStepComponent,
    DownloadStepComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatStepperModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    CardModule,
    CheckboxModule,
    DropdownModule,
    FileUploadModule,
    HttpClientModule,
    InputTextModule,
    ProgressSpinnerModule,
    StepsModule,
    TableModule,
    ToastModule,
    StepRoutingModule,
  ],
  providers: [
    CSVReaderService,
    LapReaderService,
    RouterOutlet
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
