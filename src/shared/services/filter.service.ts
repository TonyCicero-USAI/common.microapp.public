import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { Cache } from '../objects/cache';
import { Filter } from '../objects/filter';
import { Preference } from '../objects/preference';
import { User } from '../objects/user';

import { AbstractService } from './abstract.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService extends AbstractService {

    //#region CONSTANTS


    //#endregion

    //#region CONSTRUCTOR

    /**
     * Constructor.
     */
    public constructor(
        private i: Injector) {
        super(i);
    }

	// #endregion

    // #region PUBLIC METHODS

    /**
     * Get the filters save in the user preference.
     */
    public get(route: string, name: string): Filter {
        let cache: Cache = Cache.get();        
        let current: User = cache.getValue(Cache.KEYS.USER);
        let filters: any = current?.preference?.filters;
        let filter: Filter = filters?.find(f => (f.route === route) && (f.name === name));        
        return filter;
    }

    /**
     * Save the filters in the user preferences so that it is persisted and used in all
     * dashboards and tables.
     */
    public save(filter: any): Observable<any> {
        let cache: Cache = Cache.get();        
        let current: User = cache.getValue(Cache.KEYS.USER);
        if (current) {
            if (!current.preference) { current.preference = new Preference(); }
            if (!current.preference.filters) { current.preference.filters = []; }
            
            current.preference.filters;
            current.preference.filters = current.preference.filters.filter(f => (f.route !== filter.route) || (f.name !== filter.name));
            current.preference.filters.push(filter);

            let user: User = new User();
            user.pkId = current.pkId;
            user.preference = current.preference;

            cache.setValue(Cache.KEYS.USER, current);
            return this.post('/user/updateMetadata', { user }, undefined, undefined, 'Authentication');
            
            // console.log("/shared/services/filter/save: CURRENT = ", current);
        }
    }

	//#endregion
}
