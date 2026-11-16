
import { Component, OnInit} from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
    selector: 'app-back-to-top',
    templateUrl: './back-to-top.component.html',
    styleUrls: ['./back-to-top.component.less'],
    standalone: false
})

/**
 * Scroll back to top button.
 */
export class BackToTopComponent implements OnInit  {

    public isShowing = false;

    /**
     * Constructor.
     */
    public constructor() {
        fromEvent(window, 'scroll').subscribe((e: Event) => {
            const scrollPosition = e.target['scrollingElement']['scrollTop'];
            if (scrollPosition > window.innerHeight / 2) {
                this.isShowing = true;
            } else {
                this.isShowing = false;
            }
        });
    }

    /**
     * On Init.
     */
    public ngOnInit(): void {

    }

    /* UTILITY METHODS */

    /**
     * Scroll to top of page.
     */
    public scrollToTop() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

}
