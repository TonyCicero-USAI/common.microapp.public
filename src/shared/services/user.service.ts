import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../objects/user';

import { AbstractService } from './abstract.service';
import GlobalConstants from '../global.constants';
import config from '@app/app';

@Injectable({
  providedIn: 'root'
})
export class UserService extends AbstractService {

    /* CONSTANTS */
    public users;

    /* METHODS */  


    /**
     * Get the authenticated user.
     */
    public current() {
        return this.post('/user', {});
    }


    /**
     * Get the index of all users in the system.
     */
    public index() {
        return this.post('/user/index', { });
    }


}
