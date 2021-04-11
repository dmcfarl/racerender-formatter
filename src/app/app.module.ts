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
import {MatTableModule} from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormatterComponent } from './components/formatter/formatter.component';
import { UploadStepComponent } from './components/formatter/steps/upload-step/upload-step.component';
import {StepsModule} from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { FormatterRoutingModule } from './components/formatter/formatter-routing.module';
import { LapReaderService } from './components/formatter/reader/lapreader.service';
import { CSVReaderService } from './components/formatter/reader/csvreader.service';
import { RouterOutlet } from '@angular/router';
import { ColumnsStepComponent } from './components/formatter/steps/columns-step/columns-step.component';
import { LapsStepComponent } from './components/formatter/steps/laps-step/laps-step.component';
import { DownloadStepComponent } from './components/formatter/steps/download-step/download-step.component';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {CheckboxModule} from 'primeng/checkbox';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabMenuModule} from 'primeng/tabmenu';
import { TagModule } from "primeng/tag";
import { DatePipe } from '@angular/common';
import { SessionTransformService } from './components/formatter/transform/sessiontransform.service';
import { RaceWriterService } from './components/formatter/writer/racewriter.service';
import { HomeComponent } from './components/home/home.component';
import { EditorComponent } from './components/editor/editor.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    FormatterComponent,
    UploadStepComponent,
    ColumnsStepComponent,
    LapsStepComponent,
    DownloadStepComponent,
    HomeComponent,
    EditorComponent
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
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    StepsModule,
    TableModule,
    TabMenuModule,
    TagModule,
    ToastModule,
    FormatterRoutingModule,
    AppRoutingModule,
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
