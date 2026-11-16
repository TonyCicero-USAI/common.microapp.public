import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import GlobalConstants from '@src/shared/global.constants';

@Component({
    selector: 'app-loading-spinner',
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.less'],
    standalone: false
})
export class LoadingSpinnerComponent implements OnInit, OnChanges {

    @Input() text = 'Loading...';
    @Input() isLoading: boolean;
    @Input() isFullPage: boolean;
    @Input() isResize: boolean;
    @ViewChild('loaderSpinner') loader: ElementRef;

    /* ATTRIBUTES */

    public show: boolean;
    public loadDelay = 500; // if loading for > 1 sec, start spinner


    /**
     * Constructor.
     */
    public constructor() {
    }

    /**
     * On Init.
     */
    async ngOnInit() {
        if (this.isLoading) {
            this.showLoader();
        }
    }

    /**
     * On Change.
     */
    async ngOnChanges() {
        if (this.isLoading) {
            this.showLoader();
        } else {
            if (this.show) {
                this.loader.nativeElement.classList.add('loader-fade');
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.show = false;
            }
        }
    }

    /* METHODS */

    /**
     * If loading longer than 1 sec, show spinner.
     */
    async showLoader() {
        await new Promise(resolve => setTimeout(resolve, this.loadDelay)); // wait 1 sec
        if (this.isLoading) { // check if still loadeing
            this.show = true; // display spinner
        }
    }

}
