import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';

import { Cache } from '../objects/cache';

@Injectable({
  	providedIn: 'root'
})
export class PaginatorService {

	/* ATTRIBUTES */

  	public paginator: MatPaginator;

	public pageIndex: number;
	public pageSize: number;

	private baseSettings: { pageIndex: number, pageSize: number } = { pageIndex: 0, pageSize: 25 };

	private route: string;

	/* CONSTRUCTOR */

    /**
     * Constructor.
     */
	public constructor(
		private router: Router) {
		this.route = this.router.url;
	}

	/* EVENT HANDLING */
	
    /**
     * Gets paginator settings on change.
     */
	public onChanges(event): void {
		if (event.previousPageIndex !== event.pageIndex || event.pageSize !== this.pageSize) {
			this.set(event);
		} 
	}

	/* METHODS */

    /**
     * Initialize paginator service.
     */
	public init(paginator: MatPaginator): void {
		this.paginator = paginator;
		const settings = this.getSettings();
		if (settings != this.baseSettings) {
			this.set(this.paginator);
		}
	}

    /**
     * Save paginator settings to the cache.
     */
	public save(id?: string): void {
		let cache = Cache.get();
		let preferences = cache.getValue(Cache.KEYS.PREFERENCE);
		!preferences ? preferences = {} : null;

		let key = id ? id : this.router.url;
		let settings = {
			[key] : {
				pageSize: this.pageSize,
				pageIndex: this.pageIndex
			}
		};

		preferences.paginator = {...preferences.paginator, ...settings};
		cache.setValue(Cache.KEYS.PREFERENCE, preferences);
	}

    /**
     * Gets paginator settings from cache.
     */
	public getSettings(id?: any): { pageIndex: number, pageSize: number } {
		let cache = Cache.get();
		let preferences = cache.getValue(Cache.KEYS.PREFERENCE);
		!preferences ? preferences = {} : null

		let key = id ? id : this.router.url;
		let settings = preferences.paginator?.[key];
		if (!settings) {
			settings = this.baseSettings;
		}

		this.set(settings);
		this.paginator._changePageSize(settings.pageSize);
		this.paginator.pageIndex = settings.pageIndex;

		return settings;
	}

    /**
     * Sets the pageIndex and pageSize of a given object.
     */
	private set(settings): void {
		if (settings) {
			this.pageIndex = settings.pageIndex;
			this.pageSize = settings.pageSize;
		}
	}

	/**
     * Resets the pagination values for a given page.
     */
	public reset(id?: string): void {
		let key = id ? id : this.router.url;	
		let cache = Cache.get();
		let preferences = cache.getValue(Cache.KEYS.PREFERENCE);		
		if (preferences) {
			delete preferences?.paginator?.[key];
			cache.setValue(Cache.KEYS.PREFERENCE, preferences);
		}
	}

}