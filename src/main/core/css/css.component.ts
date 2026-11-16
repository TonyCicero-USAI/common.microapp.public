import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-css',
  template: `<link rel="stylesheet" type="text/css" [href]="path">`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CssComponent {

    /* ATTRIBUTES */

    cssPath: any;

    /* CONSTRUCTOR */

    /**
     * Constructor.
     */
    constructor(
        public sanitizer: DomSanitizer,
        private cd: ChangeDetectorRef) {
        
        this.cssPath = "dark.less";
        this.cd.markForCheck();
        
    }

    /* METHODS */

    /**
     * Set the css.
     */
    set path(path) {
        this.cssPath = path;
    }

    /**
     * Get the css.
     */
    get path() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.cssPath);
    }
}