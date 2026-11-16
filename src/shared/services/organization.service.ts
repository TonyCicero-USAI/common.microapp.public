import { Injectable } from '@angular/core';

import { AbstractService } from './abstract.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends AbstractService {

    /* ATTRIBUTES */

    /* CONSTRUCTOR */

    /* METHODS */

    /**
     * Get the organization.
     */
    public get() {
        return this.post('/organization');
    }
    
}
