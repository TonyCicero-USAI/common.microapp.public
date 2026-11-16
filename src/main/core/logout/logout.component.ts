import { Component } from '@angular/core';
import { Location } from '@angular/common';

import config from '@app/app';

import { AuthenticationService } from '@src/shared/services/authentication.service';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    standalone: false
})

export class LogoutComponent {

    /* ATTRIBUTES */
    
    public appHeaderVisibleStatus = false;
    public appNavigationVisibleStatus = false;

    /* CONSTRUCTORS */

    /**
     * Constructor.
     */
    public constructor(
        private authenticationService: AuthenticationService,
        private location: Location) {
        this.appHeaderVisibleStatus = config.isHeaderVisible || false;
        this.appNavigationVisibleStatus = config.isNavigationVisible || false;
        config.isHeaderVisible = false;
        config.isNavigationVisible = false;
        config.isChatAvailable = false;
    }

    /* METHODS */

    /**
     * Go back.
     */
    public cancel() {
        config.isHeaderVisible = this.appHeaderVisibleStatus;
        config.isNavigationVisible = this.appNavigationVisibleStatus;
        config.isChatAvailable = true;
        this.location.back();
    }

    /**
     * Logout and destroy the session.
     */
    public logout() {
        this.authenticationService.logout();
    }

}
