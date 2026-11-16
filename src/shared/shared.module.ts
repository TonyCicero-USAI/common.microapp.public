import { ChartModule } from 'angular-highcharts';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GojsAngularModule } from 'gojs-angular';
import { MaterialModule } from './material.module';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { RouterModule } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ClipboardModule } from '@angular/cdk/clipboard';

//#region PIPES


//#endregion

//#region DIRECTIVES

import { ComponentIfDirective } from '@src/shared/directives/component-if.directive';

//#endregion

//#region COMPONENTS

// BUSINESS


// GENERIC
import { BackToTopComponent } from '@src/shared/components/back-to-top/back-to-top.component';
import { CloseButtonComponent } from '@src/shared/components/close-button/close-button.component';
import { LoadingSpinnerComponent } from '@src/shared/components/loading-spinner/loading-spinner.component';

//#endregion

@NgModule({
    imports: [
        A11yModule,
        CdkMenuModule,
        ChartModule,
        ClipboardModule,
        CommonModule,
        FormsModule,
        GojsAngularModule,
        MaterialModule,
        PortalModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    declarations: [
        BackToTopComponent,
        CloseButtonComponent,
        LoadingSpinnerComponent,
        
        ComponentIfDirective,
    ],
    exports: [

        BackToTopComponent,
        CloseButtonComponent,
        LoadingSpinnerComponent,

        ComponentIfDirective,


    ],
    providers: [
        DatePipe,
        { provide: '$window', useValue: window },
        { provide: '$document', useValue: document },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { verticalPosition: 'top' } }
    ]
})
export class SharedModule {
    static forRoot() {
        return {
            ngModule: SharedModule,
            providers: [
            ],
            exports: [

            ]
        };
    }
}
