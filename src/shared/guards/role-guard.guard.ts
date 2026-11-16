import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { lastValueFrom } from 'rxjs';

import { Cache } from "../objects/cache";

import { SecurityService } from "../services/security.service";

@Injectable({ providedIn: "root" })
export class RoleGuard  {

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    public constructor(
        private securityService: SecurityService) {
    }

    /* METHODS */

    /**
     * Can Activate.
     */
    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        
        let routePath = state.url.split('?')[0];
        let checkAsset: boolean = route.data['checkAsset'];
        if (checkAsset) { 
            let cache = Cache.get(); 
            let asset = cache.getValue(Cache.KEYS.ASSET);
            let userPkId = cache.getValue(Cache.KEYS.USER_PKID);
            if (asset) {
                let user = { pkId: userPkId };
                if (this.securityService.isOwner(user, asset, 'Asset')) {
                    return true;
                }
                else {
                    let result = await lastValueFrom(this.securityService.checkAccess(['Route'], routePath, asset.pkId ));
                    const isAllowed = !!result?.isPermissioned;
                    return isAllowed;
                }
            }
            else {
                return false;
            }

        }
        else {
            let result = await lastValueFrom(this.securityService.checkAccess(['Route'], routePath));
            const isAllowed = !!result?.isPermissioned;
            return isAllowed;
        }

        // console.log("/shared/guards/role/canActivate: CHECK PATH = ", state.url);
    }

}
