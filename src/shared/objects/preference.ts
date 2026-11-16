export class Preference {

    /* ATTRIBUTES */

    announcements: string[]; // Add announcement pkId if it has already been seen
	filters: { route: string, name: string, value: any }[] = [];
    isNavigationExpanded: boolean = true;
    theme: string = 'light';

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    constructor(json?) {
        Object.assign(this, json);
    }

    
}
