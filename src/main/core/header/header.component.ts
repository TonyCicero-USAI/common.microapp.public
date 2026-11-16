import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subject } from 'rxjs';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';
import { User } from '@src/shared/objects/user';

import { AuthenticationService } from '@src/shared/services/authentication.service';

import { NavigationService } from '@src/shared/services/navigation.service';



@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.less'],
    animations: [],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {

    @ViewChild('drawer') drawer: MatDrawer;
    @ViewChild('successSubmitDialog') successSubmitDialog: TemplateRef<any>;

    /* CONSTANTS */

    public GLOBAL_ROUTES = {
        HELP: "private/help",
        HOME: "private/authentication/home",
        PROFILE: "private/user/profile",
        SETTINGS: "private/system"
    };

    /* ATTRIBUTES  */

    public cache; // the session cache
    public config; // the application configuration

    public configuration: any; // the organization configuration
    public current: User; // the current user
    public navigation; // the navigation
    public organization: any; // the current organization
    public preference; // the user preference

    public backgroundColor: string; // the background color
    public environment: string = ''; // the environment where the application is operating

    public isMenuOpenForAccount: boolean = false; // whether the notification menu open is open
    public isMenuOpenForMobile: boolean = false; // whether in mobile mode and menu is open
    public isMenuOpenForMobileSecondary: boolean = false; // whether in mobile mode and secondary menu is open
    public isMenuOpenForNotification: boolean = false; // whether the notification menu open is open

    private secondaryNavigationSubscription;
    public snackbarSubject = new Subject<{title:string, content:string, route:string, icon: string}>();

    public parent: any;


    /* CONSTRUCTOR */

    /**
     * Constructor. 
     */
    public constructor(
        private dialog: MatDialog,
        private eRef: ElementRef,
        private router: Router,
        private authenticationService: AuthenticationService,
        private navigationService: NavigationService) {

        let url = location.href.toLocaleLowerCase();
        if (url) {
            if (url.includes('localhost')) {
                this.environment = 'Localhost';
            }
            else if (url.includes('demo')) {
                this.environment = 'Demo';
            }
            else if (url.includes('test')) {
                this.environment = 'Test';
            }
            else if (url.includes('staging')) {
                this.environment = 'Staging';
            }
        }

        // Listen for changes to the cache object. Fix for name and organization not showing on 
        // initial load. Changes to the cache are made throughout the application and this is the
        // way to update this component.

        Cache.changeObservable.subscribe(changes => {
            if (changes.key === 'user' || changes.key === 'organization') {
                this.cache = Cache.get();
                this.current = this.cache.getValue(Cache.KEYS.USER);
                this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);
            }
        });

        Cache.changeObservable.subscribe(changes => {
            if (changes.key === 'user') {
              this.preference = this.authenticationService.getPreference();
            }
        }); 

		this.secondaryNavigationSubscription = this.navigationService.secondaryNavigationObservable.subscribe(({ item, mode }) => {
            if (mode === 'open' && this.isMenuOpenForMobile && this.isMenuOpenForMobileSecondary) return;
            else if (mode === 'close' && (!this.isMenuOpenForMobile || !this.isMenuOpenForMobileSecondary)) return;

            setTimeout(() => {
                this.selectParent(item);
            });
		});

    }

    /* EVENT HANDLING */

    /**
     * Initialize component.
     */
    public async ngOnInit(): Promise<void> {

        this.config = config;
        this.backgroundColor = this.config?.backgroundColor;
        this.navigation = Object.assign(this.config.navigation);

        this.cache = Cache.get();
        this.configuration = this.cache.getValue(Cache.KEYS.CONFIGURATION);
        this.current = this.cache.getValue(Cache.KEYS.USER);
        this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);          
        this.preference = this.authenticationService.getPreference();

        // this.messageService.notificationSubject.subscribe(res => {
        //     if (res.referenceType === 'Alert') {
        //         this.snackbarSubject.next({
        //             title: `Alert from ${res.reference?.hardwareName}`,
        //             content: `${res.reference?.description}`,
        //             route: this.config.routes.PRIVATE_DASHBOARD_CONTROL,
        //             icon: 'report_problem',
        //         });
        //     }
        // })
    }

    /**
     * Destroy.
     */
    public ngOnDestroy(): void {
        this.snackbarSubject.unsubscribe();
        if (this.secondaryNavigationSubscription) {
            this.secondaryNavigationSubscription.unsubscribe();
        }
    }

    /* METHODS */

    // MENU

    /**
     * Close the menu;
     */
    public close (): void {
        this.closeSecondary();
        this.isMenuOpenForAccount = false;
        this.isMenuOpenForMobile = false;
        this.isMenuOpenForNotification = false;
    }

    /**
     * Close Secondary the menu;
     */
    public closeSecondary(): void {
        this.isMenuOpenForMobileSecondary = false;
        this.parent = undefined;
    }

    public focusMain(): void {
        // find the main content
        const mainContentElement = document.getElementById('main-content');
        if (mainContentElement) {
            // find the first focusable element
            const firstFocusableElement = mainContentElement.querySelector('input, select, textarea, button, object, a, area[href], [tabindex]');
            // if it exists, focus it; otherwise focus the main content
            if (firstFocusableElement) {
                (<HTMLElement>firstFocusableElement).focus({ preventScroll: true });
            }
            else {
                mainContentElement.focus({ preventScroll: true });
            }
        }
    }


    /**
     * Open the menu.
     */
    public open(): void {
        setTimeout(() => {
            if (this.router.url === this.config.routes['PRIVATE_WORKSPACE_VIEW_GEN_AI']) {
                // If we are on the Chat page in Forsight, automatically open the secondary navigation
                const chatNavItem = this.navigation.find(item_ => item_.type === 'Chat');
                if (chatNavItem) {
                    this.selectParent(chatNavItem);
                }
            }
            this.isMenuOpenForMobile = true;
            this.isMenuOpenForAccount = false;
            this.isMenuOpenForNotification = false;
        })
    }

    /**
     * Select parent item.
     */
    public selectParent(item): void {
        if (this.parent === item) {
            this.parent = undefined;
            this.config['navigationItem'] = undefined;
            this.isMenuOpenForMobileSecondary= false;
        }
        else {
            this.parent = item;
            this.config['navigationItem'] = undefined;
            this.isMenuOpenForMobile = true;
            this.isMenuOpenForMobileSecondary = true;
        }
    }

    // NAVIGATION

    /**
     * Redirect to the login microservice so that the user can access the 
     * corresponding route.
     * 
     * @param route the route to redirect to. Must be one of the following:
     * 'help', 'home', 'profile', or 'settings'.
     */
    public goto(route: string): void {
        let loginRoute;
        switch (route) {
            case 'help':
                loginRoute = this.GLOBAL_ROUTES.HELP;
                break;
            case 'home':
                loginRoute = this.GLOBAL_ROUTES.HOME;
                break;
            case 'profile':
                loginRoute = this.GLOBAL_ROUTES.PROFILE;
                break;
            case 'settings':
                loginRoute = this.GLOBAL_ROUTES.SETTINGS;
                break;
            default:
                break;
        }
        if (loginRoute) {
            this.authenticationService.redirect(loginRoute).subscribe(result => {
                if (result?.domain) { window.location = result.domain; }
            })
        }
    }

    /**
     * Navigate to a route.
     */
    public navigate(route:string, queryParams?:any): void {
        this.router.navigate([route], {queryParams});
        this.close();
    }

    // UTILITIES

    /**
     * Close all dialogs.
     */
    public closeAll(): void {
        this.dialog.closeAll();
    }

    /**
     * Opens a dialog with a given template.
     */
    public openDialog(component, data?, panelClass?: string): void {

        // Set the dialog properties and open the dialog using those properties.
        // All dialogs are inteded to fill the entire screen. The dialog styles can
        // be found in the global styles.

        let properties = { width: '100vw', height: '100vh', backdropClass: 'backdrop', panelClass: '', disableClose: true, data: data };
        const dialogRef = this.dialog.open(component, properties);

        // After the dialog is opened and closed, process the returned data
        // and perform cleanup operations.

        dialogRef.afterClosed().subscribe(result => {
        });
    }

}
