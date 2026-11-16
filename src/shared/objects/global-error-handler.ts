import { HttpErrorResponse } from '@angular/common/http';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthenticationService } from '@src/shared/services/authentication.service';

import { environment } from '@src/environments/environment';


@Injectable()
export class GlobalErrorHandler extends ErrorHandler {

    /* ATTRIBUTES */

    private emptyErrorContext: ErrorContext = {
        timeStamp: null,
        message: '',
        stack: '',
        location: '',
        error: null,
        isSytem: false,
        type: ''
    };

    private errorContextSubject = new Subject<ErrorContext>();
    errorContext$ = this.errorContextSubject.asObservable();
    private lastError: ErrorContext = null;
    private sameErrorCount = 0;

    /* CONSTRUCTOR */

    /**
     * Since error handling is really important it needs to be loaded first,
     * thus making it not possible to use dependency injection in the constructor
     * to get other services such as the error handle API service to send the server
     * our error details
     */
    constructor( private injector: Injector) {
        super();
        this.errorContextSubject.next( this.emptyErrorContext );
    }

    /* METHODS */

    /**
     * Handle error.
     * @param error 
     */
    handleError( error ) {
        const locationStrategy = this.injector.get( LocationStrategy );
        const isSytem = (error instanceof HttpErrorResponse) || (error instanceof DOMException);
        const nextErrorContext: ErrorContext = {
            timeStamp: new Date(),
            message: error.message ? error.message : error.toString(),
            stack: error.stack ? error.stack : '',
            location: locationStrategy instanceof PathLocationStrategy ? locationStrategy.path() : '',
            error,
            isSytem,
            type: typeof error
        };

        // if error is from communication microservice, don't throw error.
        // we do this to preserve UX since communication service is not
        // required for applications to function.
        if (error instanceof HttpErrorResponse) {
            if (error.url.includes(environment.comHost)) {
                return;
            }
        }

        super.handleError( error );
        this.errorContextSubject.next( nextErrorContext );

        const authenticationService = this.injector.get(AuthenticationService);
        if (authenticationService.isAuthenticated()) {
            // Log the error to the server. If api call failed, let it failed; no need to 
            // verify result. We log system error right away in the background. There could 
            // be same error repeated many times that would not be neccessary to save to 
            // backend, we limit number of same errors logging to back end to 5.
            if (this.lastError === null) {
                this.lastError = nextErrorContext;
                this.logError(this.lastError);
            } 
            else {
                if (this.lastError.message === nextErrorContext.message && this.lastError.location === nextErrorContext.location) {
                    this.sameErrorCount++;
                } 
                else {
                    this.sameErrorCount = 0;
                    this.lastError = nextErrorContext;
                    this.logError(this.lastError);
                }
            }
        }
    }
    
    /**
     * Reset error count.
     */
    resetCount() {
        this.sameErrorCount = 0;
    }

    /**
     * Send error log though socket io to get logged in db
     */
    logError(errorContext: ErrorContext) {
        // NOT IMPLEMENTED
    }
}

/**
 * Error Context.
 */
export interface ErrorContext {
    timeStamp: Date;
    message: string;
    stack: string;
    location: any;
    error: any;
    isSytem: boolean;
    type: string;
}
