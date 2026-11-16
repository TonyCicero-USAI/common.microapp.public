import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';

import config from '@app/app';

import { Cache } from '@src/shared/objects/cache';
import { Preference } from '../objects/preference';
import { User } from '@src/shared/objects/user';

import { AbstractService } from '@src/shared/services/abstract.service';
import { ConfigurationService } from '@src/shared/services/configuration.service';
import { OrganizationService } from '@src/shared/services/organization.service';
import { UserService } from './user.service';

@Injectable()
export class SecurityService extends AbstractService {

    /* CONSTANTS */

    public ROLE_RANK_MAP = {
        'Guest': 10,
        'User': 20,
        'Org Admin': 30,
        'Admin': 40
    };

    public DEFAULT_ROUTES_FOR_USER = [

    ];    

    public DEFAULT_ROUTES_FOR_ORG_ADMIN = [

    ];

    public DEFAULT_ROUTES_FOR_APP_ADMIN = [

    ];

    public RETRY_ATTEMPTS = 10;   

    /* ATTRIBUTES */

    public config; // the app.ts

    public cache: Cache; // the session cache
    public current: User; // the current user
    public organization; // the organization

    public authorityObservableObject = new BehaviorSubject<any>(null);    

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        injector: Injector,
        private configurationService: ConfigurationService,
        private organizationService: OrganizationService,
        private userService: UserService) {

        super(injector);

        this.config = config;
        if (this.config.roles) {
            this.DEFAULT_ROUTES_FOR_USER = [...this.DEFAULT_ROUTES_FOR_USER, ...this.config.roles?.USER];
            this.DEFAULT_ROUTES_FOR_ORG_ADMIN = [...this.DEFAULT_ROUTES_FOR_ORG_ADMIN, ...this.config.roles?.ORG_ADMIN];
            this.DEFAULT_ROUTES_FOR_APP_ADMIN = [...this.DEFAULT_ROUTES_FOR_APP_ADMIN, ...this.config.roles?.APP_ADMIN];
        }

        for (let item of this.config.navigation) {
            if (item.permissioned) {
                if (item['roles']) {
                    for (let role of item['roles']) {
                        switch (role) {
                            case 'Admin':
                                if (item.link) {
                                    if (!this.DEFAULT_ROUTES_FOR_APP_ADMIN.includes(item.link)) {                                        
                                        this.DEFAULT_ROUTES_FOR_APP_ADMIN.push(item.link);
                                    }
                                }
                                break;
                            case 'Org Admin':
                                if (item.link) {                                        
                                    if (!this.DEFAULT_ROUTES_FOR_ORG_ADMIN.includes(item.link)) {      
                                        this.DEFAULT_ROUTES_FOR_ORG_ADMIN.push(item.link);
                                    }
                                }
                                break;
                            case 'User':
                                if (item.link) {                                        
                                    if (!this.DEFAULT_ROUTES_FOR_USER.includes(item.link)) {      
                                        this.DEFAULT_ROUTES_FOR_USER.push(item.link);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }

        // console.log("/services/security/constructor: ROUTES FOR USER = ", this.DEFAULT_ROUTES_FOR_USER);
        // console.log("/services/security/constructor: ROUTES FOR ORG ADMIN = ", this.DEFAULT_ROUTES_FOR_ORG_ADMIN);
        // console.log("/services/security/constructor: ROUTES FOR APP ADMIN = ", this.DEFAULT_ROUTES_FOR_APP_ADMIN);
    }

    /* EVENT HANDLING */

    /**
     * The security service is initiated by the signin component prior to starting 
     * the application. The security service initializes all required data and stores 
     * them in the cache.
     */
    public async init() {

        Cache.clear();
        this.cache = Cache.get();
        const user = await lastValueFrom(this.userService.current());
        if (user) {
            // console.log("/shared/services/security/init: RESULT = ", result);
            
            // Get the authenticated user and his/her organization. Then, update
            // the cache with that user and organization so that other components
            // can use them.

            this.current = user;
            let preference = this.current.preference || new Preference(); 

            this.cache.setValue(Cache.KEYS.SESSION_PKID, user.session?.sessionId);
            this.cache.setValue(Cache.KEYS.USER, this.current);
            this.cache.setValue(Cache.KEYS.USER_PKID, this.current.pkId);
            this.cache.setValue(Cache.KEYS.PREFERENCE, preference);            
            
            // console.log("/shared/services/security/init: USER = ", this.current);
            this.updateObserver();

            // Load the configuration (settings) from the database and update the cache. 
            // The configuration includes the catalog, controls, questions (fields), 
            // questionnaire, roles, and routes.

            const organization = await lastValueFrom(this.organizationService.get());
            if (organization) {
                try {
                    this.organization = organization;
                    this.cache.setValue(Cache.KEYS.ORGANIZATION, organization);
                    this.cache.setValue(Cache.KEYS.ORGANIZATION_PKID, organization.orgPkId);
                    this.updateObserver();                

                    const configuration = await lastValueFrom(this.configurationService.settings(this.organization.orgPkId));
                    if (configuration) {
                        configuration.pkId = this.organization.orgPkId;
                        this.cache.setValue(Cache.KEYS.CONFIGURATION, configuration);
                        this.updateObserver();
                    }
                } 
                catch (err) {
                    console.error(err);
                }
            }

        }
        else {
            this.updateObserver();
        }
    }

    /* METHODS */

    //#region PUBLIC

    //#region ACCESS CONTROLS

    /**
     * Check the user's membership to see the current user is authorized,
     */
    public checkMembership(type: 'Guest' | 'User' | 'Org Admin' | 'Admin', user, organizationPkId) {
        if (type && user && organizationPkId) {
            if (user.isSysAdmin) {
                return true;
            }
            else {
                const requiredRank = this.ROLE_RANK_MAP[type];
                const membershipType = user.memberOf.find(member_ => member_.organizationPkId === organizationPkId)?.membershipType;
                const rank = this.ROLE_RANK_MAP[membershipType] || 0;
                return rank >= requiredRank;
            }
        }
        else {
            return false;
        }
    }

    /**
     * Check the route to see if the current user is authorized to access it. 
     * All access to the system must go through this access control check, including
     * access to services and data.
     */
    public async checkRoute(path: string, asset?, user?, organization?): Promise<boolean> {
        if (path) {            
            // Get the currently authorized user and any other pertinent information from the cache
            // in order to perform the security checks, if the user and organization objects are not 
            // provided. If user or organization is undefined, wait 250ms and try to fetch them from 
            // cache again. This may happen after first login since there can be a small delay in 
            // saving data to the cache.

            if (user && organization) {
                this.current = user;
                this.organization = organization;
            } 
            else {
                this.cache = Cache.get();
                this.current = this.cache.getValue(Cache.KEYS.USER);
                this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);

                let retries = 0;
                while (!(this.current && this.organization) && retries < this.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, 250)); // wait 250ms
                    this.cache = Cache.get();
                    this.current = this.cache.getValue(Cache.KEYS.USER);
                    this.organization = this.cache.getValue(Cache.KEYS.ORGANIZATION);
                    retries++;
                }
            }

            // Check the user, organization, and asset, and apply the route or attribute based 
            // security. By default, the sys admin gets access to everything wtihin the application, 
            // the admin gets access to the organization settings, and the owner gets access to the 
            // asset. Otherwise, everyone gets access to the designated routes.

            if (this.current) {
                const parsedURL = path.replace(/^!|\?(.*)/, "");

                // SYSTEM ADMINISTRATOR
                if (this.current.isSysAdmin) {
                    return true;
                }
                // EVERYONE ELSE
                else {
                    // PROCESS GUEST, USER, ORG ADMIN, OR ADMIN (NO ROLES)

                    // Check the default routes for the different types of members such as Guest, User, 
                    // Org Admin, and Admin. Note that the list of default routes should be minimal and
                    // no user should be granted access to any asset by default.

                    if (this.organization) {                            
                        let routes = this.current.applications?.[0]?.routes || [];
                        for (let route of routes) {
                            if (route) {
                                if (route.name.includes('*')) {
                                    const regex = route.name.replace(/\*/g, "(.*)").replace(/[/?]/g, "\\$&");
                                    if (parsedURL.match("^" + regex + "$")) {
                                        return true;
                                    }
                                }
                                else if (route.name.includes(parsedURL)) {
                                    return true;
                                }         
                            }            
                        }
                    }
                    
                    // PROCESS USERS (WITH ROLES)

                    // Get all of the routes that the user is able to access, which is a composite 
                    // of all the routes for all roles that the user has been assigned. If an asset 
                    // is passed in, we must prevent a user with a role in one asset from accessing
                    // another asset.

                    let routes = [];
                    if (asset) {
                        // OWNER OF ASSET                        
                        if (this.isOwner(this.current, asset, 'Asset')) {
                            return true;
                        }
                        // TEAM MEMBER
                        else {
                            this.current.applications[0].roles.map((role) => {
                                if (role.routes?.length) {
                                    if (role.organizationPkId === this.organization.orgPkId) {
                                        if (role.assetPkIds.includes(asset.pkId)) {
                                            routes = routes.concat(role.routes);
                                        }
                                    }
                                }
                            });
                        }
                    }
                    else {   
                        // console.log ("/services/security/checkRoute: CURRENT = ", this.current);
                        this.current.applications?.[0].roles.map((role) => {
                            if (role.routes?.length) {
                                if (role.organizationPkId === this.organization.orgPkId) {
                                    routes = routes.concat(role.routes);
                                }
                            }
                        });
                    }

                    // CHECK ACCESS CONTROLS

                    // Check to see if the current route is within the list of assigned 
                    // routes. The regular expression is used because we are permitting 
                    // the use of the wildcard '*'.

                    const route = routes.find((route) => {
                        const regex = route.name.replace(/\*/g, "(.*)").replace(/[/?]/g, "\\$&");
                        return parsedURL.match("^" + regex + "$");
                    });
                    
                    return route ? true : false;

                    // console.log ("/services/security/checkRoute: CHECK ACCESS (SYS ADMIN) :", parsedURL, "; ALLOWED? :", true);
                    // console.log ("/services/security/checkRoute: CHECK ACCESS (APP ADMIN) :", parsedURL, "; ALLOWED? :", true);
                    // console.log ("/services/security/checkRoute: CHECK ACCESS (APP ADMIN) : ROUTE = ", route, "; ALLOWED? :", false);
                    // console.log ("/services/security/checkRoute: CHECK ACCESS (ASSET OWNER) :", parsedURL, "; ALLOWED? :", true);
                    // console.log ("/services/security/checkRoute: CHECK ACCESS (TEAM MEMBER) :", parsedURL, "; ALLOWED? :", true);
                    // console.log ("/services/security/checkRoute: CHECK ACCESS (USER) :", parsedURL, "; ALLOWED? :", route ? true : false);
                }
            }
        }

        return false;
    }

    /**
     * Check access to route through authentications service.
     */
    public checkAccess(checks: ('Asset' | 'Role' | 'Route')[], route: string, assetPkId?: string): Observable<any> {
        return this.post('/security/checkAccess', { assetPkId, applicationPkId:config.appPkId, checks, route, type: 'Client' });
    }


    /**
     * Check if the user is an 'Admin', 'Org Admin' or SysAdmin.
     */
    public isAdmin(user: any, organizationPkId: string): boolean {
        const isSysAdmin = user.isSysAdmin;
        const membershipType = user.memberOf.find(member_ => member_.organizationPkId === organizationPkId)?.membershipType;
        if (isSysAdmin || ['Admin', 'Org Admin'].includes(membershipType)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Check whether the user is an other of the specified object .
     */
    public isOwner(
        user: any, 
        data: any,
        type: 'Asset' | 'Organization') {

        if (user) {
            if (data) {
                switch(type) {
                    case 'Asset':
                        if (data.ownerPkId === user.pkId || data.ownerPkIds?.includes(user.pkId)) { return true; }
                        break;
                    case 'Organization':
                        break;
                    default:
                        break;
                }
            }
        }
        return false;
    }

    //#endregion


    //#region ROLES 

    /**
     * assign the specified role to the user.
     */
    public assignRole(userPkId: string, assetPkId: string, rolePkId: string) {
        return this.post('/security/role/assign', { applicationPkId: config.appPkId, userPkId, assetPkId, rolePkId });
    }


    /**
     * List roles.
     */
    public listRoles(applicationPkId: string, organizationPkId: string) {
        return this.post('/security/role/list', { applicationPkId, organizationPkId });
    }

    /**
     * Delete the specified role from the user.
     */
    public unassignRole(userPkId: string, assetPkId: string, rolePkId: string) {
        return this.post('/security/role/unassign', { applicationPkId: config.appPkId, userPkId, assetPkId, rolePkId });
    }

    //#endregion  

    //#endregion

    //#region PRIVATE

    /**
     * Update hte observer to listen to the changes to the user, organization,
     * and cache objects.
     */
    private updateObserver() {
        this.authorityObservableObject.next({
            user: this.current,
            organization: this.organization,
            cache: this.cache,
        })
    }

    //#endregion

}
