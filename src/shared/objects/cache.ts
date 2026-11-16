import { Subject } from 'rxjs';

import { User } from '@src/shared/objects/user';

/**
 * The cache contains all of the data stored in the local session storage. 
 */
export class Cache {

    /* CONSTANTS */

    public static KEYS = {
        ASSET : "asset",
        ASSET_PKID : "assetPkId",
        CATALOG : 'catalog',
        ASSESSMENT_PLAN : "assessmentPlan",
        CONFIGURATION : "configuration",
        CONTEXT: 'context',
        CONTROL : "control",
        CONTROL_PKID : "controlPkId",
        CONTROLS : "controls",
        CONTROLS_FILTERED: "controlsFiltered",
        BLOCK: "block",
        ENDPOINTS: "endpoints",
        FILTERS : "filters",
        ISSUE: "issue",
        MODEL: "model",
        OBJECT: "object",
        ORGANIZATION: "organization",
        ORGANIZATION_PKID : "organizationPkId",
        PAGE: "page",
        PHASE : "phase",
        PREFERENCE : "preferences",
        PROCESS : "process",
        PROCESS_METADATA : "processMetadata",
        ROUTES: 'routes',
        SESSION_PKID : "sessionPkId",
        STEP : "step",
        USER : "user",
        USER_PKID : "userPkId",
        USERS : "users"
    }

    /* ATTRIBUTES */

    private assetPkId: string; // selected asset id
    private assessmentPlan: {}; // the selected assessment plan
    private controlPkId: string; // selected control id
    private organizationPkId: string; // selected organization id
    private sessionPkId: string; // session id which is likekly the user id
    private userPkId: string; // selected user id

    private asset: any; // the selected asset
    private catalog: any; // the selected catalog
    private configuration: any; // the configuration for the organization
    private context; // dynamic context for chat or any other module
    private control: any; // the selected control
    private controls: []; // an index of the controls
    private controlsFiltered: []; // an index of the filtered controls
    private block: any;
    private endpoints: any; // endpoints that can be called by the microapp
    private filters: any; // the filters for tables
    private issue: any; // selected Issue
    private model: any; // the selected model
    private object: any; // any object
    private organization: any; // the selected organization
    private page: string; // the selected page to redirect the user to upon login
    private phase: any; // the selected phase
    private preferences: string; // the user's preferences
    private process: string; // the selected process
    private processMetadata; // the selected process' metadata
    private routes: any;
    private step: any; // the selected step
    private user: User; // the authenticated user
    private users: []; // the index of users in the organization

    static changeObservable = new Subject<any>(); // observable to detect changes in the cache

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json || {});
    }
   
    /**
     * On changes.
     */
    public static onChanges() {
        return this.changeObservable;
    }

    /**
     * Initialize the cache for the specified user.
     */
    public init(user: User) {
        if (user) { 
            this.user = user;
            this.userPkId = user.pkId;
        }

        Cache.set(this)
    }

    /* SINGLETONE */

    /**
     * Clear the cache from local session storage
     */
    public static clear() {
        sessionStorage.clear();
        localStorage.removeItem('cache');
    }

    /**
     * Get the cache from the local session storage.
     */
    public static get() {

        let key = "cache";
        let value = sessionStorage.getItem(key);
        if (value) {
            let cache: Cache = new Cache(JSON.parse(value));    
            return cache;
        }
        else {
            let cache = new Cache();        
            this.set(cache);
            return cache;
        }
    }

    /**
     * Set the cache in the local session storage.
     */
    public static set(cache: Cache) {
        if (cache) {
            let key = "cache";
            let value = JSON.stringify(cache);
            sessionStorage.setItem(key, value);
        }
    }

    /* METHODS */

    /**
     * Get the value stored in the local session.
     */
    public getValue(key: string) {

        switch(key) {
            case Cache.KEYS.ASSET                : return this.asset;
            case Cache.KEYS.ASSET_PKID           : return this.assetPkId;
            case Cache.KEYS.ASSESSMENT_PLAN      : return this.assessmentPlan;
            case Cache.KEYS.CATALOG              : return this.catalog;
            case Cache.KEYS.CONFIGURATION        : return this.configuration;
            case Cache.KEYS.CONTEXT              : return this.context;
            case Cache.KEYS.CONTROL              : return this.control;
            case Cache.KEYS.CONTROL_PKID         : return this.controlPkId;
            case Cache.KEYS.CONTROLS             : return this.controls;
            case Cache.KEYS.CONTROLS_FILTERED    : return this.controlsFiltered;
            case Cache.KEYS.BLOCK                : return this.block;
            case Cache.KEYS.ENDPOINTS            : return this.endpoints;
            case Cache.KEYS.FILTERS              : return this.filters;
            case Cache.KEYS.ISSUE                : return this.issue;
            case Cache.KEYS.MODEL                : return this.model;
            case Cache.KEYS.OBJECT               : return this.object;
            case Cache.KEYS.ORGANIZATION         : return this.organization;
            case Cache.KEYS.ORGANIZATION_PKID    : return this.organizationPkId;
            case Cache.KEYS.PAGE                 : return this.page;
            case Cache.KEYS.PHASE                : return this.phase;
            case Cache.KEYS.PREFERENCE           : return this.preferences;
            case Cache.KEYS.PROCESS              : return this.process;
            case Cache.KEYS.PROCESS_METADATA     : return this.processMetadata;
            case Cache.KEYS.ROUTES               : return this.routes;
            case Cache.KEYS.SESSION_PKID         : return this.sessionPkId;
            case Cache.KEYS.STEP                 : return this.step;
            case Cache.KEYS.USER                 : return this.user;
            case Cache.KEYS.USER_PKID            : return this.userPkId;
            case Cache.KEYS.USERS                : return this.users;
            default                              : return "";
        }

    }

    /**
     * Save the cache with the latest data stored in memory. We have to do
     * this because the session serializes the cache and must be deserialized
     * when getting the values.
     */
    public save() {
        Cache.set(this);
    }

    /**
     * Set a value in the cache.
     */
    public setValue(key: string, value: any) {
        
        switch(key) {
            case Cache.KEYS.ASSET                : this.asset = value; this.controls = null; this.controlsFiltered = null; break;
            case Cache.KEYS.ASSET_PKID           : this.assetPkId = value; break;
            case Cache.KEYS.ASSESSMENT_PLAN      : this.assessmentPlan = value; break;
            case Cache.KEYS.CATALOG              : this.catalog = value; break;
            case Cache.KEYS.CONFIGURATION        : this.configuration = value; this.context = null; break;
            case Cache.KEYS.CONTEXT              : this.context = value; break;
            case Cache.KEYS.CONTROL              : this.control = value; break;
            case Cache.KEYS.CONTROL_PKID         : this.controlPkId = value; break;
            case Cache.KEYS.CONTROLS             : this.controls = value; break;
            case Cache.KEYS.CONTROLS_FILTERED    : this.controlsFiltered = value; break;
            case Cache.KEYS.BLOCK                : this.block = value; break;
            case Cache.KEYS.ENDPOINTS            : this.endpoints = value; break;
            case Cache.KEYS.FILTERS              : this.filters = value; break;
            case Cache.KEYS.ISSUE                : this.issue = value; break;
            case Cache.KEYS.MODEL                : this.model = value; break;
            case Cache.KEYS.OBJECT               : this.object = value; break;
            case Cache.KEYS.ORGANIZATION         : this.organization = value; break;
            case Cache.KEYS.ORGANIZATION_PKID    : this.organizationPkId = value; break;
            case Cache.KEYS.PAGE                 : this.page = value; break;
            case Cache.KEYS.PHASE                : this.phase = value; break;
            case Cache.KEYS.PREFERENCE           : this.preferences = value; break;
            case Cache.KEYS.PROCESS              : this.process = value; this.phase = null; this.step = null; this.controls = null; this.controlsFiltered = null; break;
            case Cache.KEYS.PROCESS_METADATA     : this.processMetadata = value; break;
            case Cache.KEYS.ROUTES               : this.routes = value; break;
            case Cache.KEYS.SESSION_PKID         : this.sessionPkId = value; break;
            case Cache.KEYS.STEP                 : this.step = value; break;
            case Cache.KEYS.USER                 : this.user = value; break;
            case Cache.KEYS.USER_PKID            : this.userPkId = value; break;
            case Cache.KEYS.USERS                : this.users = value; break;
        }

        Cache.set (this);
        Cache.changeObservable.next({key, value});
    }
}

/**
 * AuthCache 
 */
export class AuthCache {
    nodePkIds: string[] = [];
    auths: {
        pkId: string;
        code?: string;
        url: string;
    }[] = [];
    option: 'All' | 'Selected' | 'Rerun' | 'Start At' = 'All';

    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json || {});
    }

    /**
     * Get the auth from the local session storage.
     */
    public static get() {
        let value = sessionStorage.getItem('auth');
        if (value) {
            let auth: AuthCache = new AuthCache(JSON.parse(value));
            return auth;
        }
        else {
            let auth = new AuthCache();
            this.set(auth);
            return auth;
        }
    }

    /**
     * Get the auth from the local session storage.
     */
    public static getUnfinishedAuth() {
        const auth = AuthCache.get();
        return auth.auths.find(a => !a.code);
    }

    /**
     * Set the auth in the local session storage.
     */
    public static set(auth: AuthCache) {
        if (auth) {
            let value = JSON.stringify(auth);
            sessionStorage.setItem('auth', value);
        }
    }

    /**
     * Set Auth Code to existing auth
     */
    public static setCode(pkId: string, code: string) {
        if (!pkId && !code) return false;
        const auth = AuthCache.get();
        const authCode = auth.auths.find(ac => ac.pkId === pkId);
        if (authCode) {
            authCode.code = code;
            AuthCache.set(auth);
            return true;
        }
        return false;
    }

    /**
     * Add Auth Code
     */
    public static addAuth(pkId: string, url: string, code?: string) {
        if (!pkId) return;
        const auth = AuthCache.get();
        const authCode = auth.auths.find(ac => ac.pkId === pkId);
        if (authCode) {
            authCode.code = code;
            authCode.url = url;
        }
        else {
            auth.auths.push({ pkId, url, code });
        }
        AuthCache.set(auth);
    }

    /**
     * Check if all auth having Code
     */
    public static hasAllCodes() {
        const auth = AuthCache.get();
        if (auth.auths.length < 1) { return false; }
        return auth.auths.every(ac => ac.code);
    }

    /**
     * Set option
     */
    public static setOption(option: 'All' | 'Selected' | 'Rerun' | 'Start At') {
        const auth = AuthCache.get();
        auth.option = option;
        AuthCache.set(auth);
    }
    

    /**
     * Add selected nodes
     */
    public static setSelectedNodes(pkIds:string[]) {
        const auth = AuthCache.get();
        auth.nodePkIds = pkIds;
        AuthCache.set(auth);
    }


    /**
     * Clear authCodes
     */
    public static clearNodes() {
        const auth = AuthCache.get();
        auth.nodePkIds = [];
        AuthCache.set(auth);
    }

    /**
     * Clear authCodes
     */
    public static clearAuthCodes() {
        const auth = AuthCache.get();
        auth.auths = [];
        AuthCache.set(auth);
    }

    /**
     * Clear auth in session storage
     */
    public static clear() {
        sessionStorage.removeItem('auth');
    }
}
