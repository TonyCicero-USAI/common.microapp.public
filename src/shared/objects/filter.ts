import { v4 as uuidv4 } from 'uuid';

/**
 * The filter interface is used to store all of the filters in the user preferences.
 */
export class Filter {

    /* ATTRIBUTES */

    public pkId: string; // the id
    public name: string; // the filter name
    public route: string; // the route where the filter applies     

    // The filter values contain all of the dynamic database query used to limit
    // the search result returned from the server to optimize the page load time
    // and performance.

    public value: {
        and?: any,
        or?: any
    };

    // The metadata contains any pertinent information except the database query 
    // including, but not limited to the search keyword, paging, sorting, tab index, 
    // etc.  

    public metadata: {      
        group?: { fields: string[], first: string[], sum: {newField: string, oldField: string, condition: string }[] },
        search: { keyword: string, fields: string [] },
        sort: { active: string, direction: 'asc' | 'desc' | '' },
        state: any,
        rule?: string,
        tabIndex?: number
    }; 

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json || {});
        if (!this.pkId) { this.pkId = uuidv4(); }
    }
    
}