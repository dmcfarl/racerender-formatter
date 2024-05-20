import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormatterComponent } from './components/formatter/formatter.component';
import { UploadFormatterStepComponent } from './components/formatter/steps/upload-formatter-step/upload-formatter-step.component';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { FormatterRoutingModule } from './components/formatter/formatter-routing.module';
import { LapReaderService } from './services/lapreader.service';
import { CSVReaderService } from './services/csvreader.service';
import { RouterOutlet } from '@angular/router';
import { ColumnsFormatterStepComponent } from './components/formatter/steps/columns-formatter-step/columns-formatter-step.component';
import { LapsFormatterStepComponent } from './components/formatter/steps/laps-formatter-step/laps-formatter-step.component';
import { DownloadFormatterStepComponent } from './components/formatter/steps/download-formatter-step/download-formatter-step.component';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TagModule } from "primeng/tag";
import { DatePipe } from '@angular/common';
import { SessionTransformService } from './services/sessiontransform.service';
import { RaceWriterService } from './services/racewriter.service';
import { HomeComponent } from './components/home/home.component';
import { EditorComponent } from './components/editor/editor.component';
import { AppRoutingModule } from './app-routing.module';
import { EditFormatterStepComponent } from './components/formatter/steps/edit-formatter-step/edit-formatter-step.component';
import { ImportComponent } from './components/import/import.component';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ComposerComponent } from './components/composer/composer.component';
import { LapsComposerStepComponent } from './components/composer/steps/laps-composer-step/laps-composer-step.component';
import { DownloadComposerStepComponent } from './components/composer/steps/download-composer-step/download-composer-step.component';
import { TimeTextBoxComponent } from './components/timetextbox/timetextbox.component';

@NgModule({
  declarations: [
    AppComponent,
    ComposerComponent,
    LapsComposerStepComponent,
    DownloadComposerStepComponent,
    FormatterComponent,
    UploadFormatterStepComponent,
    ColumnsFormatterStepComponent,
    LapsFormatterStepComponent,
    DownloadFormatterStepComponent,
    HomeComponent,
    EditorComponent,
    EditFormatterStepComponent,
    ImportComponent,
    TimeTextBoxComponent
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
    DialogModule,
    DropdownModule,
    FileUploadModule,
    HttpClientModule,
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    StepsModule,
    TableModule,
    TabMenuModule,
    TagModule,
    ToastModule,
    TooltipModule,
    FormatterRoutingModule,
    AppRoutingModule,
    DatePipe
  ],
  providers: [
    CSVReaderService,
    RaceWriterService,
    LapReaderService,
    SessionTransformService,
    RouterOutlet,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
