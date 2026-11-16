import { HttpClient, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '@src/environments/environment';
import app from '@app/app';
import { Cache } from '../objects/cache';


interface DownloadEvents {
    type: HttpEventType.DownloadProgress;
    loaded: number;
    total?: number;
}

// tslint:disable-next-line: max-classes-per-file
@Injectable({
    providedIn: 'root'
})
export class AbstractService {

    /* ATTRIBUTES */

    protected static tokenExpired = false;
    protected static requestsPendingSubject: BehaviorSubject<number> = new BehaviorSubject(1);
    protected static sessionError: BehaviorSubject<any> = new BehaviorSubject(null);

    protected httpClient: HttpClient;
    protected window: Window;
    protected document: Document;

    protected cachedMap = new Map<string, any>();
    protected lang: string;
    protected snackBar;
    protected requestsPending = 0;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        @Inject(Injector) private injector: Injector) {

        AbstractService.tokenExpired = false;
        this.httpClient = this.injector.get(HttpClient);
        this.snackBar = this.injector.get(MatSnackBar);

        this.window = this.injector.get('$window'); // tslint:disable-next-line: deprecation        
        this.document = this.injector.get('$document'); // tslint:disable-next-line: deprecation        
    }

    /* METHODS */

    /**
     * Get the url for the server.
     */
    public getApiUrl() {
        return location.hostname.includes("localhost") ? app.devApiBaseUrl : '/api';
    }
    
    /**
     * Get the url for the server.
     */
    public getSrvUrl() {
       return location.hostname.includes("localhost") ? app.devApiBaseUrl : '';
    }

    /**
     * Get the url for the communication server.
     */
    public getComUrl() {
        return environment.comHost;
    }

    /**
     * Get file extension
     */
    public getFileExtension(filename) {
        return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
    }

    /**
     * Get the full url.
     */
    public getFullUrl(url: string, service: 'Application' | 'Authentication' | 'Communication' | 'Configuration' = 'Application') {
        const cache = Cache.get();
        const endpoints = cache.getValue(Cache.KEYS.ENDPOINTS);
        let apiUrl: string;
        switch(service) {
            case 'Application':
                apiUrl = this.getApiUrl();
                break;
            case 'Authentication':
                apiUrl = endpoints?.authentication || '';
                break;
            case 'Communication':
                apiUrl = endpoints?.communication || this.getComUrl() || 'debug';
                break;
            case 'Configuration' :
                apiUrl = endpoints?.configuration || '';
                break;
            default:
                apiUrl = this.getApiUrl();
        }

        return apiUrl + url;
    }

    /**
     * Get session id for session storage.
     * @returns 
     */
    public getSID() {
        return sessionStorage.getItem('SID') || '';
    }

    /**
     * Downloads a file in the browser given a blob.
     */
    public async downloadFromBlob(data: any, filename: string, contentType?: string) {
        let blob;
        if (data instanceof Blob) {
            blob = data;
        } else {
            const arrayBuffer = new Uint8Array(data.data);
            blob = new Blob([arrayBuffer], { type: contentType });
        }

        const url = this.window['URL'].createObjectURL(blob);

        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.href = url;
        anchor.target = '_blank';
        anchor.download = filename;
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => { anchor.remove(); }, 100);

    }

    /**
     * Call the server with the http post. Preprocess all errors arising
     * from the server.
     */
    public post(url: string, body?, options?, token?, service: 'Application' | 'Authentication' | 'Communication' | 'Configuration' = 'Application'): Observable<any> {

        // Setup the headers with the proper options.  With credentials is
        // set so that the system uses the cookie as a form of authentication.
        // The options are attached to the header here so that all inheriting
        // classes don't have to do this.

        url = this.getFullUrl(url, service);
        options = this.prepareHeaders(options, token);
        Object.assign(options, { withCredentials: true });

        let isDownloadCall = false;
        if (options.responseType === 'blob' || options.isDownload) {
            isDownloadCall = true;
            options.responseType = 'blob';
        }

        // Call the server using http post which is more secure than http
        // get because the payload in the post is encrypted via SSL, whereas
        // the url request params is not encrypted.

        this.requestsPending += 1;
        AbstractService.requestsPendingSubject.next(this.requestsPending);
        return this.httpClient.post(url, body, options).pipe(
            catchError(e => {
                this.requestsPending--;
                AbstractService.requestsPendingSubject.next(this.requestsPending);

                // When an error occurs, check to see if it is caused by an invalid 
                // token, which occurs when the cookie expired or wasn't properly set. 
                // If the token is invalid, then redirect the user to the login to
                // relogin.

                if (e.error) {
                    if (e.status === 401) {
                        let redirectUrl = e.error.resultErrorResolve.redirect;
                        console.log("/common/services/abstract/post(): ERROR = ", e);
                        console.log("/common/services/abstract/post(): REDIRECT URL = ", redirectUrl);
                        window.location.href = redirectUrl || 'https://login.unitedsolutions.io/';
                    }
                }         
                return throwError(e);
            }),
            map((res: any) => {
                this.requestsPending--;
                AbstractService.requestsPendingSubject.next(this.requestsPending);
                if (options.observe === 'events' && options.reportProgress) {
                    // observe download progress
                    const events = res as DownloadEvents;
                    if (events.type.valueOf() !== 4) {
                        return {
                            type: events.type,
                            loaded: events.loaded
                        };
                    }
                }
                if (isDownloadCall) {
                    // download call. get filename from header and return data
                    const cacheControl = res.headers.get('content-disposition');
                    let filename;
                    if (cacheControl && cacheControl.indexOf('filename=') > -1) {
                        const match = cacheControl.match(/(?:filename=)(?:"|)(.*?[^\\])(?:\"|$)/);
                        filename = match ? match.pop() : undefined;
                    }
                    const fileData = {
                        file: res.body,
                        filename: filename,
                        contentType: res.headers.get('Content-Type')
                    };
                    return fileData;
                }
                else {
                    // return data
                    return res.body;
                }
            })
        );
    }

    /**
     * Prepare the header with the proper options and settings.
     */
    private prepareHeaders(options: any, token?) {
        const sid = this.getSID();
        const url = this.window.location.href.substring(this.window.location.href.indexOf('/private')); // provide client url for changelog

        if (!options) {
            return {
                observe: 'response',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Expose-Headers': ['X-Auth-SID', 'X-Client-URL'],
                    'X-Auth-SID': sid,
                    'X-Client-URL': url
                }
            };
        }

        if (!options.observe) {
            options.observe = 'response';
        }

        if (!options.headers) {
            options.headers = {
                'Content-Type': 'application/json',
                'Access-Control-Expose-Headers': ['X-Auth-SID', 'X-Client-URL'],
                'X-Auth-SID': sid,
                'X-Client-URL': url

            };
        }

        if (!options.headers['X-Auth-Token']) {
            options.headers['Access-Control-Expose-Headers'] = ['X-Auth-SID', 'X-Client-URL'];
            options.headers['X-Auth-SID'] = sid;
            options.headers['X-Client-URL'] = url;
        }

        return options;
    }

    /**
     * Set session id for session storage.
     */
    public setSID(sessionId: string) {
        sessionStorage.setItem('SID', sessionId || '');
    }

}
