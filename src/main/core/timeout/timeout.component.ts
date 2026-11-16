import { Component, OnInit } from '@angular/core';
import { Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import config from '@app/app';

import { AuthenticationService } from '@src/shared/services/authentication.service';

@Component({
    selector: 'app-timeout',
    templateUrl: './timeout.component.html',
    styleUrls: ['./timeout.component.css'],
    standalone: false
})
export class TimeoutComponent implements OnInit {

    /* ATTRIBUTES */

    public countdown = 0;
    public idleState = 'Not Started.';
    public timedOut = false;
    public lastPing?: Date = null;
    public isHeaderVisible = true;
    public isNavigationVisible = true;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private idle: Idle,
        private keepalive: Keepalive,
        private location: Location,
        private router: Router,
        private authenticationService: AuthenticationService) {
        this.isHeaderVisible = config.isHeaderVisible;
        this.isNavigationVisible = config.isNavigationVisible;

        config.isChatAvailable = false;
        config.isHeaderVisible = false;
        config.isNavigationVisible = false;
    }

    /* EVENT HANDLING */

    /**
     * On Init.
     */
    public ngOnInit(): void {

        // When the user has been idled for more than the allowable time
        // period, show the countdown timer. The timer uses the local
        // countdown variable.

        this.idle.onTimeoutWarning.subscribe((countdown) => {
            this.countdown = countdown;
        });

        // When the session has timed out, automatically logout of the system
        // and clear the session and cookie. A timeout is defined as the idle
        // time plus the countdown.

        this.idle.onTimeout.subscribe(() => {
            this.idleState = 'Timeout: Your session has timed out!';
            this.timedOut = true;
            this.logout();
        });
    }

    /* METHODS */

    /**
     * Cancel logout and redirect back to calling page.
     */
    public continue() {
        this.reset();
        this.location.back();
    }

    /**
     * Logout, destroy cookie, and redirect to public page.
     */
    public logout() {
        // console.log("/private/authentication/logout/logout()");
        this.authenticationService.logout();
        // this.router.navigate(['/']);
    }

    /**
     * Reset the watch.
     */
    public reset() {
        // console.log("Timeout: Reset watch()!");
        config.isChatAvailable = true;
        config.isHeaderVisible = this.isHeaderVisible;
        config.isNavigationVisible = this.isNavigationVisible;
        this.idle.watch();
        this.idleState = 'Started.';
        this.timedOut = false;
    }

}
