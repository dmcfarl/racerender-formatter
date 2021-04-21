import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormatterComponent } from './components/formatter/formatter.component';
import { EditorComponent } from './components/editor/editor.component';
import { UploadStepComponent } from './components/formatter/steps/upload-step/upload-step.component';
import { ColumnsStepComponent } from './components/formatter/steps/columns-step/columns-step.component';
import { LapsStepComponent } from './components/formatter/steps/laps-step/laps-step.component';
import { EditStepComponent } from './components/formatter/steps/edit-step/edit-step.component';
import { DownloadStepComponent } from './components/formatter/steps/download-step/download-step.component';



const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    {
        path: 'formatter', component: FormatterComponent, children: [
            { path: '', redirectTo: 'upload-step', pathMatch: 'full' },
            { path: 'upload-step', component: UploadStepComponent },
            { path: 'columns-step', component: ColumnsStepComponent },
            { path: 'laps-step', component: LapsStepComponent },
            { path: 'edit-step', component: EditStepComponent },
            { path: 'download-step', component: DownloadStepComponent }
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
