
import { Observable, of } from 'rxjs';
import { Injectable, Injector } from '@angular/core';

import { Cache } from '@src/shared/objects/cache';

import { AbstractService } from '@src/shared/services/abstract.service';
import { NavigationItem } from '../objects/navigationItem';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService extends AbstractService {

    /* ATTRIBUTES */
    
    public cache: Cache; // the session cache
    public configuration; // the organization configuration

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(injector: Injector) {
        super(injector);
    }

    /* METHODS */
  
    //#region ___

    /**
     * Copy the specified processes, frameworks, controls, forms, and fields and return
     * the appropriate components to be cached in the client.
     */
    public copy(processPkId, organizationPkId): Observable<any> {         
        return this.post('/configuration/process/copy', {processPkId, organizationPkId});
    }
   
    /**
     * Get the index of all organizations limiting results to desired query and projection
     */
    public list(query: any, projection: any): Observable<any[]> {
        return this.post('/configuration/list', { query, projection });
    }   

    /**
     * Get the list of public processes and components that other organizations can copy from
     * when setting up their organization.
     */
    public public(): Observable<any> {
        return this.post('/configuration/public');
    }

    /**
     * Get the organization configurations.
     */
    public settings(pkId: string, cache = true): Observable<any> {
        return this.post('/configuration/settings', { pkId });
    }

    /**
     * Update the metadata.
     */
    public updateMetadata(metadata: any) {        
        return this.post('/configuration/updateMetadata', { metadata });
    }

    //#endregion

    //#region DASHBOARD

    /**
     * Update the predefined lists.
     */
     public updateDashboardConfig(dashboards) {        
        return this.post('/configuration/dashboard/update', { dashboards });
    }

    //#endregion

    //#region NAVIGATION

    /**
     * Update the Navigation.
     */
    public updateNavigation(navigation: NavigationItem[]) {        
        return this.post('/configuration/navigation/update', { navigation });
    }

    //#endregion


    //#region STANDARDS

    /**
     * Update the pre-approved technology standards for each organization so
     * that authors can selected from the preapproved standard when writing
     * the implementation statements. 
     */
    public updateApprovedTechnology(technology: any) {
        return this.post('/configuration/standard/technology/update', { technology });
    }

    //#endregion
    
    //#region TERMS

    /**
     * Update the data map used to translate application terms to customer terms.
     */
    public updateOverlays(overlays: any) {        
        return this.post('/configuration/overlays/update', { overlays });
    }

    /**
     * Update the data map used to translate application terms to customer terms.
     */
    public updateExtensions(extensions: any) {        
        return this.post('/configuration/extensions/update', { extensions });
    }

    /**
     * Update the data map used to translate application terms to customer terms.
     */
    public updateTerms(terms: any) {        
        return this.post('/configuration/terms/update', { terms });
    }

    /**
     * Synchronize Configuration from cataog collection.
     */
    public synchronize(catalogPkId: string): Observable<any> {
        return this.post('/catalog/synchronize/configuration', {catalogPkId})
    }

    //#endregion
   
}