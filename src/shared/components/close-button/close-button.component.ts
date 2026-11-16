import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-close-button',
    templateUrl: './close-button.component.html',
    styleUrls: ['./close-button.component.less'],
    standalone: false
})
export class CloseButtonComponent {
    
    @Input() route;
    @Input() isDialog;

    /**
     * Constructor.
     */
    public constructor(
        private location: Location,
        private router: Router,
        private dialog: MatDialog) {
    }

    /**
     * Go back to the prior/container component.
     */
    public close() {
        if (!this.isDialog) {
            if (!this.route) {
                this.location.back();
            } 
            else {
                this.router.navigateByUrl(this.route);
            }
        } else {
            this.dialog.closeAll();
        }
        
    }

}
