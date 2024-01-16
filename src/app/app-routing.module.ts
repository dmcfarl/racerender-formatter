import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormatterComponent } from './components/formatter/formatter.component';
import { EditorComponent } from './components/editor/editor.component';
import { UploadFormatterStepComponent } from './components/formatter/steps/upload-formatter-step/upload-formatter-step.component';
import { ColumnsFormatterStepComponent } from './components/formatter/steps/columns-formatter-step/columns-formatter-step.component';
import { LapsFormatterStepComponent } from './components/formatter/steps/laps-formatter-step/laps-formatter-step.component';
import { EditFormatterStepComponent } from './components/formatter/steps/edit-formatter-step/edit-formatter-step.component';
import { DownloadFormatterStepComponent } from './components/formatter/steps/download-formatter-step/download-formatter-step.component';
import { ComposerComponent } from './components/composer/composer.component';
import { LapsComposerStepComponent } from './components/composer/steps/laps-composer-step/laps-composer-step.component';
import { DownloadComposerStepComponent } from './components/composer/steps/download-composer-step/download-composer-step.component';



const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    {
        path: 'composer', component: ComposerComponent, children: [
            { path: '', redirectTo: 'laps-step', pathMatch: 'full' },
            { path: 'laps-step', component: LapsComposerStepComponent },
            { path: 'download-step', component: DownloadComposerStepComponent }
        ]
    },
    {
        path: 'formatter', component: FormatterComponent, children: [
            { path: '', redirectTo: 'upload-step', pathMatch: 'full' },
            { path: 'upload-step', component: UploadFormatterStepComponent },
            { path: 'columns-step', component: ColumnsFormatterStepComponent },
            { path: 'laps-step', component: LapsFormatterStepComponent },
            { path: 'edit-step', component: EditFormatterStepComponent },
            { path: 'download-step', component: DownloadFormatterStepComponent }
        ]
    },
    //{ path: 'editor', component: EditorComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: false }
        ),
        CommonModule
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
    static routes: Routes = appRoutes;
}
