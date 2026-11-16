import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';

import { AuthenticationService } from '@src/shared/services/authentication.service';
import { SecurityService } from '@src/shared/services/security.service';
import { UserService } from '@src/shared/services/user.service';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css'],
    standalone: false
})
export class SigninComponent implements OnInit, AfterViewInit {

    /* ATTRIBUTES */

    public cache; // the session cache

    public asset; // the selected asset
    public configuration; // the organization configuration
    public organization; // the organization
    public phase; // the selected phase
    public step; // the selected step
    private preferences; // user Preferences

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private dialog: MatDialog,

        private authenticationService: AuthenticationService,
        private securityService: SecurityService,
        private userService: UserService) { 

    }

    /* EVENT HANDLING */

    /**
     * The authentication service redirects the user to the signin component after 
     * s/he has successful authenticated through the identity provider and internal 
     * application registry. The user information is passed to signin. The signin 
     * initializes the cache so that the first route can be checked by the role guard. 
     * The signin also passes the user metadata to the security service to be saved 
     * into the application database.
     */
    public async ngOnInit() {

        this.route.queryParams.subscribe(async params => {

            //#region INIT
            
            // Get the data from the parameters in the URL. The data could
            // contain information such as the user profile that is required
            // to initialize the application security.

            await this.securityService.init(); 
            
            //#endregion

            //#region CACHE

            // We use the session storage to cache small data sets and the local storage 
            // to cache large data and improve system performance. The list of users for 
            // large organizations must be cached and lazily initialized since this 
            /// component is used by many other components.

            this.cache = Cache.get(); // the session cache
            this.configuration = this.cache.getValue(Cache.KEYS.CONFIGURATION);
            this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);
            this.preferences = this.authenticationService.getPreference(); 

            if (this.organization) {
                let value = this.cache.getValue(Cache.KEYS.USERS);
                if (!value) {    
                    const users = await lastValueFrom(this.userService.index());
                    if (users) {
                        this.cache.setValue(Cache.KEYS.USERS, users);
                    }
                }
            }

            //#endregion

            //#region PAGE

            // Get the page from the parameters in the URL. If a page exists
            // then exract the settings and set up the cache with the proper
            // data before routing to the page.

            let page = params?.page;
            if (page) {     
                page = atob(page); // decode using base 64
                let url = new URL(page);
                window.location.replace(page);
            }
            else if (config.defaultRoute) {
                this.router.navigateByUrl(config.defaultRoute);
            }

            //#endregion
        });

    }

    /**
     * After View Init.
     */
    public ngAfterViewInit() {

    }

    /* METHODS */


}
