import { browser, by, element } from 'protractor';

export class AppPage {
  /**
   * Navigates to the signin page /auth/signin
   */
  navigateTo() {
    return browser.get('/auth/signin');
  }

  /**
   * waits for angular to load the page then gets the title text
   * passes the value into the callback
   * @param callback fulfillment clalback
   */
  getTitleText(callback) {
    browser.waitForAngular().then(onfullfilled => {
      callback(element(by.css('title')).getText());
    });
  }
}
