import * as _ from 'lodash';
import { Injectable, Injector } from '@angular/core';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';
import { Preference } from '@src/shared/objects/preference';

import { AbstractService } from './abstract.service';

@Injectable({ providedIn: 'root' })

export class AuthenticationService extends AbstractService {

    /* CONSTANTS */

    /* ATTRIBUTES */

    private config;
  
    /* CONSTRUCTORS */

    /**
     * Constructor.
     */
    public constructor(private i: Injector) {
        super(i);
        this.config = config;
    }

    /* METHODS */

    // PREFERENCES 

    /**
     * Return the user preferences.
     */
    public getPreference(): Preference {
        let cache = Cache.get();
        let user = cache.getValue(Cache.KEYS.USER);
        return user?.preference || new Preference(); // default Preference when NULL
    }

    /**
     * Get the socket.io settings.
     * If this socket is intended for a single channel, pass channelPkId as a parameter.
     */
    public getSocketSettings(channelPkId?: string) {

        return {
            agent: false,
            auth: async (cb) => cb({
                applicationName: this.config.appName,
                applicationPkId: this.config.appPkId,
                channelPkId: channelPkId,
            }),
            path: "/socket.io", // default is /socket.io
            reconnection: true,
            rejectUnauthorized: false,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            transports: ['websocket'],
            upgrade: true,
            // withCredentials: true
        };
    }

    /**
     * Refresh cookie session.
     */
    public keepAlive() {
        return this.post('/authentication/keepAlive');
    }

    /**
     * Set the user preferences and save it to the database and cache.
     */
    public setPreference(preference: Preference): void {

        let cache = Cache.get();
        let user = cache.getValue(Cache.KEYS.USER);
        user.preference = preference;
        cache.setValue(Cache.KEYS.PREFERENCE, preference)
        cache.save();
    }

    // USER
       
    /**
     * Returns true if the user has been authenticated.
    */
    public isAuthenticated(): boolean {
        let cache = Cache.get();
        let user = cache.getValue(Cache.KEYS.USER);
        return !!user;
    }

    /**
     * Login.
     */
    public login(encryptedUser?) {
        return this.post("/authentication/signin", { encryptedUser });
    }

    /**
     * Logout.
     */
    public logout() {
        Cache.clear();
        this.post("/authentication/signout", { }).subscribe(result => {
        });
    }

    // UTILITIES

    /**
     * Redirect the user to the app and path.
     */
    public redirect(path: string) {
        return this.post('/authentication/redirect', { path });
    }

}
