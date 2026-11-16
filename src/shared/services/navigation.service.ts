import { Injectable } from "@angular/core";
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { Subject } from "rxjs";

import { filter } from 'rxjs/operators';

import { Cache } from '@src/shared/objects/cache';
import { NavigationItem } from "../objects/navigationItem";


@Injectable({
    providedIn: "root",
})
export class NavigationService {

    private history: string[] = [];

    private cache: Cache;
    private routerData;

    public navEventTrigger: string;
    public navEventUrl: string;

    public secondaryNavigationObservable = new Subject<{item: NavigationItem, mode: 'toggle' | 'open' | 'close'}>();



    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private router: Router
    ) {
        this.routerData = router.events.pipe(
            filter((event: NavigationEvent) => {
                return (event instanceof NavigationStart);
            }))
            .subscribe((event: NavigationStart) => {
                if (event.navigationTrigger === 'popstate') {
                    // browser navigation
                    this.setCacheData(event);
                    this.history.pop();
                }
                else if (event.navigationTrigger === 'imperative') {
                    // angular router navigation
                    const lastIndex = this.history.lastIndexOf(event.url);
                    if (lastIndex != -1) {
                        // If the current route was found in the history we will assume we are navigating back
                        // to the previous route and remove all other history after that point. This seems like a risky
                        // assumption but it seems to work For Atom's navigation.
                        this.history.length = lastIndex + 1;
                    }
                    else {
                        // user navigated to a different page. Push the new route into the history array.
                        // maintain a max history length of 100 to prevent any issues with cache size.
                        this.history.push(event.url)
                        if (this.history.length > 100) {
                            this.history.splice(0, 1);
                        }
                    }
                }

                // We must reinitialize the cache to ensure we are not overwriting any previous changes.
                this.cache = Cache.get();
                let routes = this.cache.getValue(Cache.KEYS.ROUTES);
                if (!routes) { routes = {} };
                routes['history'] = this.history;
                this.cache.setValue(Cache.KEYS.ROUTES, routes);
            });

        // We must get the history from cache when the service is intitialized. This will allow us
        // to keep track of routing history even if the user has refreshed the page.
        this.cache = Cache.get();
        const routes = this.cache.getValue(Cache.KEYS.ROUTES);
        this.history = routes?.['history'] || [];
    }


    /* METHODS */

    /**
     * Get Previous Route.
     */
    public getPreviousRoute() {
        return Array.isArray(this.history) && this.history.length >= 2 ? this.history[this.history.length - 2] : '';
    }

    /**
     * Get the previous route prior to a provided level.
     */
    public getPreviousRouteBeforeLevel(level: string) {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (!this.history[i].includes(level)) {
                return this.history[i];
            }
        }
    }

    /**
     * Get the previous route prior to a provided levels.
     */
    public getPreviousRouteBeforeLevels(levels: string[]) {
        for (let i = this.history.length - 1; i >= 0; i--) {
            if (!levels.some(level => this.history[i].includes(level))) {
                return this.history[i];
            }
        }
    }

    /**
     * Get Route history.
     */
    public getHistory() {
        return this.history;
    }

    /**
     * Set Cache data depending on visited url
     */
    private setCacheData(event: any) {

    }

    /**
     * Toggle secondary navigation.
     */
    public toggleSecondaryNavigation(item: NavigationItem, mode: 'toggle' | 'open' | 'close' = 'toggle') {
        this.secondaryNavigationObservable.next({ item, mode });
    }

    /**
     * Unsubscribe from main router data observable
     */
    public unsubscribe() {
        this.routerData.unsubscribe();
    }

}









