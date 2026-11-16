import { Injectable } from "@angular/core";

import { Filter } from "../objects/filter";

import { AbstractService } from "@src/shared/services/abstract.service";

@Injectable({
    providedIn: "root",
})
export class DataService extends AbstractService {

    /* METHODS */

    /**
     * Get a subset of the data in any collection filtered by the specified filters. The start number
     * is the index and the limit is the number of records to return to the client. Note, this method
     * is used by the infinite table to query very large data sets. 
     */
    public getByIndex(
        filters: Filter,
        collection: string,
        project: any,
        start: number,
        limit: number,
        service: "Application" | "Authentication" | "Communication" | "Configuration" = "Application") {

        return this.post("/data/get/index", { filters, collection, project, start, limit }, undefined, undefined, service);
    }

    /**
     * Get Fields for all collections.
     */
    public getFields() {
        return this.post("/data/get/fields", {});
    }

    /**
     * Insert a single document into a collection.
     */
    public insertOne(collection: string, document: any, options?: any) {
        return this.post("/data/insertOne", { collection, document, options });
    }

    /**
     * Insert multiple documents into a collection.
     */
    public insertMany(collection: string, documents: any[], options?: any) {
        return this.post("/data/insertMany", { collection, documents, options });
    }

    /**
     * Update a single document in a collection.
     */
    public updateOne(collection: string, filters: Filter, updateDocument: any, options?: any) {
        return this.post("/data/updateOne", { collection, filters, updateDocument, options });
    }

    /**
     * Update multiple documents in a collection.
     */
    public updateMany(collection: string, filters: Filter, updateDocument: any, options?: any) {
        return this.post("/data/updateMany", { collection, filters, updateDocument, options });
    }

    /**
     * Remove a single document from a collection.
     */
    public remove(collection: string, filters: Filter, options?: any) {
        return this.post("/data/remove", { collection, filters, options });
    }

}









