
export class NavigationItem {

    /* ATTRIBUTES */

    public type: 'Link' | 'Divider' | 'Training' | string;
    public icons?: { active: string, inactive: string } = {active: '', inactive: ''};
    public title?: string;
    public link?: string;
    public params?: any = {};
    public active?: RegExp | string;
    public permissioned?: boolean;
    public children?: NavigationItem[];

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    constructor(json?) {
        Object.assign(this, json);
    }

    /* METHODS */

}
