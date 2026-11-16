import { Preference } from "./preference";

export class User {

    /* ATTRIBUTES */

    public _id: string;
    
    public pkId: string;
    public firstName: string;
    public middleName: string;
    public lastName: string;
    public email: string;
    public cellPhone: string;
    public workPhone: string;

    public isActive: boolean;
    public isSysAdmin: boolean;

    public applications: any;
    public memberOf: any;
    public preference: Preference = new Preference({});

    public createDate: Date;
    public updateDate: Date;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(json?) {
        Object.assign(this, json);
    }

    /* METHODS */

    /**
     * Get the user's full name.
     */
    public getFullName(includeMiddleName: boolean = false): string {
        const nameParts = [this.firstName];
        if (includeMiddleName && this.middleName) {
            nameParts.push(this.middleName);
        }
        nameParts.push(this.lastName);
        return nameParts.join(' ').trim();
    }
}
