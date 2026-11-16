import { ChangeDetectorRef, Component, ErrorHandler, Input, isDevMode, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ErrorContext } from '@src/shared/objects/global-error-handler';
import { GlobalErrorHandler } from '@src/shared/objects/global-error-handler';


@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.less'],
    standalone: false
})
export class ErrorComponent implements OnInit, OnDestroy  {
  
    @Input() isSystemError: boolean;
    @ViewChild('errorDialog') errorDialog;

    /* ATTRIBUTES */

    show: boolean;
    showDetail: boolean;
    showButtons = true;
    showBackButton: boolean;
    class: string;
    isEnvProduction: boolean;

    errorContextState$: Observable<ErrorContext>;
    errorContext: ErrorContext;
    errorContexts: ErrorContext[] = [];
    errorContextSubscription: Subscription;
    errorStack: string[];
    hasError = false;

    private defaultError: ErrorContext = {
        timeStamp: null,
        message: '',
        stack: '',
        location: '',
        error: null,
        isSytem: false,
        type: ''
    };

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    constructor(
        private cdRef: ChangeDetectorRef,
        private dialog: MatDialog,
        private errorHandler: ErrorHandler,
        private router: Router) {
          
        this.errorContext = this.defaultError;
        if ( this.errorHandler instanceof GlobalErrorHandler ) {
            this.errorContextState$ = this.errorHandler.errorContext$;
        }

        this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => {
            this.reset();
            if ( this.errorHandler instanceof GlobalErrorHandler ) {
              this.errorHandler.resetCount();
            }
        });
    }

    /**
     * On Init.
     */
    ngOnInit() {

        this.isEnvProduction = !isDevMode();

        if ( this.errorContextState$ ) {
            this.errorContextSubscription = this.errorContextState$.subscribe( data => {
                this.errorContext = data;
                this.errorContexts.push(data);

                this.isSystemError = this.isSystemError || data.isSytem;
                this.hasError = true;
                this.show = (this.isEnvProduction === false) || this.isSystemError;
                this.closeAll();

                if ((this.isEnvProduction === false) || this.isSystemError)  {
                    this.openDialog(this.errorDialog);
                }
                
                this.class = this.isSystemError ? 'full-screen' : 'alert alert-danger';
                // this.showButtons = this.authenticationService.isAuthenticated();
                this.cdRef.detectChanges();
            });
        }
    }

    /**
     * On Init.
     */
    ngOnDestroy() {
        if ( this.errorContextSubscription ) {
            this.errorContextSubscription.unsubscribe();
        }
    }

    /* METHODS */

    /**
     * Reset.
     */
    reset() {
        this.errorContext = this.defaultError;
        this.show = false;
        this.closeAll();
        this.isSystemError = false;
        this.errorContexts = [];
    }

    // UTILITIES

    /**
     * Close dialog.
     */
    closeAll() {
        this.dialog.closeAll();
    }

    /**
     * Open dialog.
     */
    openDialog(component) {        
        
        // Set the dialog properties and open the dialog using those properties.
        // All dialogs are inteded to fill the entire screen. The dialog styles can
        // be found in the global styles.

        let properties = { width: '100vw', height: '100vh', backdropClass: 'backdrop', panelClass: '', disableClose: true, data: {} };
        const dialogRef = this.dialog.open(component, properties);

        // After the dialog is opened and closed, process the returned data
        // and perform cleanup operations.

        dialogRef.afterClosed().subscribe(result => {
        });
    }
}
