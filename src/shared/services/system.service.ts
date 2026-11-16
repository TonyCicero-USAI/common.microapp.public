import { Injectable } from '@angular/core';

import { AbstractService } from '@src/shared/services/abstract.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService extends AbstractService {

  /* CONSTRUCTOR */

  /* METHODS */


  /**
   * get App settings.
   */
  public getAppSettings(): Observable<{ maxUploadFileSize: number }> {
    return this.post('/system/settings');
  }

  /**
   * Get endpoints.
   */
  public getEndpoints(): Observable<any> {
    return this.post('/system/getEndpoints');
  }
}
