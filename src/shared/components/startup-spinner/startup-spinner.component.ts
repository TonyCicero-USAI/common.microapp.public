import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-startup-spinner',
    templateUrl: './startup-spinner.component.html',
    styleUrls: ['./startup-spinner.component.less'],
    standalone: false
})
export class StartupSpinnerComponent implements OnInit {
  @Input() isLoading: boolean;
  @ViewChild('loaderSpinner') loader: ElementRef;
  show: boolean;
  loadDelay = 500; // if loading for > 1 sec, start spinner
  constructor() { }

  async ngOnInit() {
    if (this.isLoading) {
      this.showLoader();
    }
  }

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

  // if loading longer than 1 sec, show spinner
  async showLoader() {
    await new Promise(resolve => setTimeout(resolve, this.loadDelay)); // wait 1 sec
    if (this.isLoading) { //check if still loadeing
      this.show = true; // display spinner
    }
  }

}
