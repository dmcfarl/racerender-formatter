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


@NgModule({
  declarations: [
    AppComponent,
    DragndropDirective,
    ProgressComponent,
    ExtractorDirective,
    MultistepFormComponent,
    StepMenuComponent,
    UploadStepComponent
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
    StepsModule,
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
