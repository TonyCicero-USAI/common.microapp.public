import { Directive, ElementRef, Input} from '@angular/core';

import { SecurityService } from '../services/security.service';

@Directive({
    selector: '[componentIf]',
    standalone: false
})
export class ComponentIfDirective {  

    @Input() matElement; // some material components cannot be disabled through elementRef
    @Input() form; // used for disabling an entire ngForm
    @Input() showAsDisabled: boolean;
    @Input() set componentIf(data: { val: string, asset: any  }) {
        if (data.val) {
            this.securityService.checkRoute(data.val, data.asset).then(canActivate => {
                if (!canActivate) {
                    if (this.showAsDisabled) {
                      // check if element is iterable & disable children
                      const isIterable = (value) => { return Symbol.iterator in Object(value); };
                      if (isIterable(this.elementRef.nativeElement)) {
                          for (let el of this.elementRef.nativeElement) {                          
                              el.onclick = () => { return false; }; // prevent any onClick events
                              el.disabled = true;
                          }
                      }
                      
                      if (this.matElement) { this.matElement.disabled = true; } // disable material componenents (eg. chipList)

                      // disable ngform controls
                      // we need to wait for the ngForm to render before we can disable it
                      if (this.form) {
                          setTimeout(() => {
                              Object.keys(this.form?.form?.controls).forEach(ctrl => {
                                  this.form?.form?.controls[ctrl]?.disable();
                              });
                          }, 1000);
                      }
                      
                      this.elementRef.nativeElement.onclick = () => { return false; }; // prevent any onClick events                      
                      this.elementRef.nativeElement.disabled = true; // set disabled = true
                    } 
                    else {
                        // hide element from dom
                        // this.elementRef.nativeElement.style.display = 'none';
                        this.elementRef.nativeElement.style.setProperty("display", "none", "important");
                    }
                }
            });
        }
    }

    /**
     * Constructor.
     */
    public constructor(
      private elementRef: ElementRef,
      private securityService: SecurityService) { 

    }
}
