import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';

import { ErrorComponent } from '@src/main/core/error/error.component';

import { AuthenticationService } from '@src/shared/services/authentication.service';

@Component({
    selector: 'main-app',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.less'],
    animations: [
        trigger('fade', [
            transition(':enter', [
                style({ opacity: '0' }),
                animate('225ms 2s cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: '1' }))
            ]),
            transition(':leave', [
                style({ opacity: '1' }),
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: '0' }))
            ])
        ])
    ],
    standalone: false
})

/**
 * Main
 */
export class MainComponent implements OnInit, OnChanges {

    @ViewChild(ErrorComponent) errorComponent: ErrorComponent;

    /* CONSTANTS */

    /* ATTRIBUTES */

    public config; // app.ts
    public cache: Cache; // the session cache
    public current; // the current user
    public organization; // the current organization

    public backgroundColor: string; // the background color
    public idleState = 'Not Started.'; // the idle state for logging the idle status
    public timedOut = false; // the amount of time to wait before auto logging out the user
    public lastPing?: Date = null; // the last time pinging the server

    // public cssUrl: string;
    public keepAliveDelay = 1000 * 10; // the amount of time to wait before calling the server to keep alive the session
    public lastInterupt = new Date().getTime(); // the last date/time to invoke the keep alive

    public isBannerVisible = false; // whether the banner is visible
    public isSidebarExpanded = true; // whether the sidebar is expanded
    public isSidebarSecondaryExpanded = false; // whether the secondary sidebar is expanded

    /* CONSTRUCTORS */

    /**
     * Constructor.
     */
    public constructor(
        private idle: Idle,
        private keepalive: Keepalive,
        private router: Router,
        private title: Title,

        private authenticationService: AuthenticationService) {
          
        this.config = config; // app.ts
        this.backgroundColor = this.config?.backgroundColor;
        title.setTitle(config.appName.charAt(0).toUpperCase() + config.appName.slice(1));

        //#region WATCH / TIMER

        // We have to start the watch and keep track of how long the user has 
        // been idled. The system listens for clicks, scrolls, and events defined 
        // in the interrupt sources to determine whether the user is using the 
        // system.

        this.idle.setIdle(14 * 60); // 14 min idle time for production
        this.idle.setTimeout(1 * 60); // 1 minute countdown before auto logout
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // sets the default interrupts like clicks, scrolls, touches to the document

        // this.idle.setIdle(10); // 10 seconds idle time for development
        // this.idle.setTimeout(30); // 30 second countdown before auto logout
        // this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // sets the default interrupts like clicks, scrolls, touches to the document

        // When the user has been idled for more than the allowable time
        // period, automatically route him/her to the timeout component to
        // allow him or her to continue the session.

        this.idle.onIdleStart.subscribe(() => {
            this.idleState = 'Master: You\'ve gone idle!'
            this.router.navigate(['timeout']);
            // console.log(this.idleState);
            // this.childModal.show();
        });

        /// OnInterrupt, call keepAlive route to reset session Cookie
        this.idle.onInterrupt.subscribe(() => {
            const now = new Date().getTime();
            if ((now - this.lastInterupt) > this.keepAliveDelay) {
              if (!location.pathname.startsWith('/public')) {
                this.authenticationService.keepAlive().subscribe(res => {
                  // console.log('keepAlive', res.timeStamp);
                });
              }
              this.lastInterupt = now;
            }
        });

        // When the user is no longer idle, we must reset the watch so 
        // that it can restart the timer.

        this.idle.onIdleEnd.subscribe(() => {
            this.idleState = 'Master: You are no longer idle.'
            // console.log(this.idleState);
            this.reset();
        });

        this.keepalive.interval(5); // sets the ping interval to 5 seconds
        this.keepalive.onPing.subscribe(() => {
            this.lastPing = new Date()
        });

        this.reset();

        //#endregion
        
    }

    /* EVENT HANDLING */

    /**
     * On Changes.
     */
    public ngOnChanges() {
    }

    /**
     * On Init.
     */
    public async ngOnInit() {

        //#region CACHE

        // We must get the latest data from the cache and use the organization's metadata 
        // to deterimine whether to show or hide the banner, header, sidebard, and content area
        // by injected specifc css classes into these components.

        this.cache = Cache.get();
        this.current = this.cache.getValue(Cache.KEYS.USER);
        this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);
        this.isBannerVisible = this.organization?.metadata?.banner;
        // listen to Org changes in the cache
        Cache.changeObservable.subscribe(res => {
            if (res.key === Cache.KEYS.ORGANIZATION) {
                const organization = res.value;
                this.isBannerVisible = organization?.metadata?.banner;
                
            }
        });
        
        //#endregion

        //#region KEEPALIVE

        // If the user is not on a public page then when we the application loads we must 
        // call the keepalive route to immediatly check that the user has an active session. 
        // If the user is not authenticated then user will be redirected to login, if the 
        // domain is known, or to an error page if the domain is not known.

        if (!location.pathname.startsWith('/public') && !location.pathname.startsWith('/signin')) {
            this.authenticationService.keepAlive().subscribe();
        }

        //#endregion
    }

    /* METHODS */

    /**
     * Reset the watch.
     */
    public reset() {
        // console.log("Master: Reset watch()!");
        this.idle.watch();
        this.idleState = 'Started the watch.';
        this.timedOut = false;
    }

}
