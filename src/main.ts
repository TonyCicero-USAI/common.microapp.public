

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { MainModule } from './main/main.module';

if (environment.production) {
  enableProdMode();
}

if (!environment.enableDebug) {
  window.console.log = function() {};
  window.console.error = function() {};
}

(window as any).MonacoEnvironment = {
  getWorkerUrl: function () {
    const workerUrl = `${window.location.origin}/assets/monaco/min/vs/base/worker/workerMain.js`;

    return URL.createObjectURL(new Blob([`
      self.MonacoEnvironment = {
        baseUrl: '${window.location.origin}/assets/monaco/min/'
      };
      importScripts('${workerUrl}');
    `], { type: 'text/javascript' }));
  }
};

platformBrowserDynamic().bootstrapModule(MainModule);
