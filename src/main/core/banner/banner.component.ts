import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';
import { User } from '@src/shared/objects/user';

import { AuthenticationService } from '@src/shared/services/authentication.service';


@Component({
    selector: 'banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.less'],
    animations: [],
    standalone: false
})
export class BannerComponent implements OnInit, OnDestroy {

      /* CONSTANTS */

    /* ATTRIBUTES  */

    public cache; // the session cache
    public config; // the application configuration

    public configuration: any; // the organization configuration
    public current: User; // the current user
    public navigation; // the navigation
    public organization: any; // the current organization
    public preference; // the user preference

    public backgroundColor: string;
    public textColor: string;
    
    /* CONSTRUCTOR */

    /**
     * Constructor. 
     */
    public constructor() {
    }

    /* EVENT HANDLING */

    /**
     * Initialize component.
     */
    public async ngOnInit(): Promise<void> {

        this.config = config;

        this.cache = Cache.get();
        this.configuration = this.cache.getValue(Cache.KEYS.CONFIGURATION);
        this.current = this.cache.getValue(Cache.KEYS.USER);
        this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);

        this.backgroundColor = this.sanitizeHexColor(this.organization?.metadata?.bannerBackgroundColor) || '#FFFFFF';
        this.textColor = this.sanitizeHexColor(this.organization?.metadata?.bannerTextColor) || '#000000';

    }

    /**
     * Destroy.
     */
    public ngOnDestroy(): void {
    }

    /* METHODS */

    /**
     * Sanitizes a color hex code by removing any leading or trailing whitespace and ensuring it matches the expected format.
     */
    private sanitizeHexColor(hexCode: string) {
        hexCode = hexCode?.trim();
        if (/^[#]{0,1}[0-9A-Fa-f]{6}$/.test(hexCode)) {
            return hexCode;
        }
    }

}
