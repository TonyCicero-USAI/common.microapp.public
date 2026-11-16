import * as _ from "lodash";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, output, TemplateRef, ViewChild } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { MatDrawer } from "@angular/material/sidenav";
import { Router } from "@angular/router";

import config from "@app/app";

import { Cache } from "@src/shared/objects/cache";
import { NavigationItem } from "@src/shared/objects/navigationItem";
import { Utility } from "@src/shared/objects/utility";

import { AuthenticationService } from "@src/shared/services/authentication.service";
import { NavigationService } from "@src/shared/services/navigation.service";

@Component({
    selector: "navigation",
    templateUrl: "./navigation.component.html",
    styleUrls: ["./navigation.component.less"],
    standalone: false
})
export class NavigationComponent implements OnInit, OnDestroy {

	@ViewChild("drawer") drawer: MatDrawer;
	@ViewChild("successSubmitDialog") successSubmitDialog: TemplateRef<any>;

	@Output() onSidebarExpanded = new EventEmitter<any>();
	@Output() onSidebarSecondaryExpanded = new EventEmitter<any>();

	/* ATTRIBUTES  */

	private cache: Cache;
	public config;

	public navigation: NavigationItem[] = [];
	public parent: any;
	public preference;

	public isNavigationExpanded = true;
	public isNavigationSecondaryExpanded = false;

	private secondaryNavigationSubscription;

	/* CONSTRUCTOR */

	/**
	 * Constructor.
	 */
	public constructor(
		@Inject(DOCUMENT) private document: Document,
		public router: Router,
		private authenticationService: AuthenticationService,
		private navigationService: NavigationService,) {

		this.secondaryNavigationSubscription = this.navigationService.secondaryNavigationObservable.subscribe(({ item, mode }) => {
            if (mode === 'open' && this.isNavigationSecondaryExpanded) return;
            else if (mode === 'close' && !this.isNavigationSecondaryExpanded) return;

            setTimeout(() => {
                this.selectParent(item);
            });
		});

	}

	/* EVENT HANDLING */

	/**
	 * Initialize component.
	 */
	public async ngOnInit() {
		this.cache = Cache.get();
		this.config = config;

		const configuration = this.cache.getValue(Cache.KEYS.CONFIGURATION);
		this.config.navigation = configuration?.navigation?.length ? configuration.navigation : this.config.navigation;
		this.navigation = this.config.navigation;

		this.preference = this.authenticationService.getPreference();
		this.isNavigationExpanded = this.preference.isNavigationExpanded;

		this.config['isNavigationExpanded'] = this.isNavigationExpanded;

		// the navigation item is temporarily stored in the config so that we can 
		// reopen the secondary navigation when navigating between pages where the 
		// side navigation is hidden.
		if (this.config['navigationItem']) {
			this.selectParent(this.config['navigationItem']);
		}


		setTimeout(() => {
			this.onSidebarExpanded.emit(this.isNavigationExpanded);
			this.onSidebarSecondaryExpanded.emit(this.isNavigationSecondaryExpanded);
		});
	}

	/**
	 * Destroy.
	 */
	public ngOnDestroy() {
		if (this.secondaryNavigationSubscription){
			this.secondaryNavigationSubscription.unsubscribe();
		}
	}

	/* METHODS */

	/**
	 * Check url.
	 */
	public checkMatch(url: string | RegExp | (string | RegExp)[]): boolean {
		if (url) {
			switch (url.constructor.name) {
				case 'RegExp':
					return (url as RegExp).test(this.router.url);
				case 'String':
					const RE = RegExp;
					const regex = new RE(url as string);
					return regex.test(this.router.url);
			}
		}
		else {
			return false;
		}
	}


	/**
	 * Show or hide the side navigation and save the user's preference.
	 */
	public showHide() {
		this.isNavigationExpanded = !this.isNavigationExpanded;
		this.config['isNavigationExpanded'] = this.isNavigationExpanded;

		this.preference = this.authenticationService.getPreference();
		this.preference.isNavigationExpanded = this.isNavigationExpanded;
		this.authenticationService.setPreference(this.preference);
		
		this.onSidebarExpanded.emit(this.isNavigationExpanded);
		this.hideSecondary();
	}

	/**
	 * Show or hide secondary navigation menu.
	 */
	public hideSecondary() {
		this.parent = undefined;
		this.config['navigationItem'] = undefined;
		this.isNavigationSecondaryExpanded = false;
		this.onSidebarSecondaryExpanded.emit(this.isNavigationSecondaryExpanded);
	}

	/**
	 * Select parent item.
	 */
	public selectParent(item) {
		if (this.parent === item) {
			this.parent = undefined;
			this.config['navigationItem'] = undefined;
			this.isNavigationSecondaryExpanded = false;
			this.onSidebarSecondaryExpanded.emit(this.isNavigationSecondaryExpanded);
		}
		else {
			this.parent = item;
			this.config['navigationItem'] = item;
			this.isNavigationExpanded = true;
			this.isNavigationSecondaryExpanded = true;
			this.onSidebarSecondaryExpanded.emit(this.isNavigationSecondaryExpanded);
		}
	}

}
