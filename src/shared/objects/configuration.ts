import { NavigationItem } from './navigationItem';

export class Configuration {

    /* CONSTANTS */


    /* FIELDS */

    public pkId: string;
    public name: string;
    public acronym: string;
    public status: 'Active' | 'Inactive' = 'Active';

    public overlays: any;
    public extensions: any;
    public standards: any;
    public terms: any;

    public catalogs: any[] = [];
    public dashboards: any[] = []; 
    public documents: any[] = [];
    public fields: any[] = [];
    public financials: any[] = [];
    public navigation: NavigationItem[] = [];
    public processes: any[] = [];
    public roles: any[] = [];
    public routes: any[] = [];
    public templates: any[] = [];

    public securityCode: string = '';
    
    /* ATTRIBUTES */

    public users: any[] = []; // this of authorized users for this organization
    public technologMap: Map<string, any> = new Map<string, any>(); // list of technologies mapped by control id

    /* CONSTRUCTOR */
    
    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json || {});        
        if (!this.technologMap || Object.keys(this.technologMap).length === 0) { 
            this.technologMap = new Map<string, any>(); 
        }
    }

    /* METHODS */

    /**
     * Load all of the pre-approved technologies and index them by control 
     * id so that the table can look up the pre-approved technologies by 
     * control id.
     */
    public getTechnologyMap() {
        // console.log("/shared/objects/configuration/getTechnologyMap: Configuration = ", this);
        // console.log("/shared/objects/configuration/getTechnologyMap: TECHNOLOGY MAP = ", this.technologMap);
        if (this.standards.technology?.length) {
            for (let technology of this.standards.technology) {    
                for (let key of technology.controls) {
                    if (this.technologMap.has(key)) {
                        let value: any [] = this.technologMap.get(key);
                        let data = { name : technology.name, isStandard : true }; // add a flag to indicate whether it is a standard technology
                        value.push(data);
                    }
                    else {
                        let value = [];
                        let data = { name : technology.name, isStandard : true }
                        value.push(data);
                        this.technologMap.set(key, value);
                    }
                }
            }
        }
        return this.technologMap;
    }

    /**
     * Translate the term into the customer term if the mapping exists.
     */
    public translate (term) {
        if (term) {            
            if (this.terms) {
                let value = this.terms[term];
                return value ? value : term;
            }
        }
        return term;
    }

}
