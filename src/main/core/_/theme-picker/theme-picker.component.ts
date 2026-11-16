import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Cache } from "@src/shared/objects/cache";
import { AuthenticationService } from '@src/shared/services/authentication.service';

@Component({
  standalone: false,
  selector: 'app-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrl: './theme-picker.component.scss'
})
export class ThemePickerComponent {

  public preference;
  public themeModes: { name: string, value: string, icon: string, svg: any }[] = [
    {
      name: 'Light', value: 'light', icon: 'light_mode', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <g filter="url(#filter0_f_5626_7025)">
    <path d="M12.6426 20.7725C12.6426 21.1227 12.3581 21.4072 12.0078 21.4072C11.6576 21.4072 11.374 21.1227 11.374 20.7725V19.6299C11.5805 19.6466 11.7892 19.6572 12 19.6572C12.2165 19.6572 12.4307 19.6455 12.6426 19.6279V20.7725ZM18.7344 17.7246L18.8154 17.8242C18.9778 18.0704 18.951 18.4044 18.7344 18.6211C18.5175 18.838 18.1827 18.865 17.9365 18.7021L17.8379 18.6211L17.0068 17.79C17.3269 17.513 17.6252 17.2116 17.8955 16.8857L18.7344 17.7246ZM6.11035 16.8916C6.38118 17.2174 6.67945 17.5191 7 17.7959L6.17676 18.6201L6.07812 18.7012C5.83193 18.864 5.4971 18.8369 5.28027 18.6201C5.03259 18.3724 5.03259 17.9703 5.28027 17.7227L6.11035 16.8916ZM20.8877 11.2598L21.0156 11.2725C21.3047 11.3315 21.5225 11.588 21.5225 11.8945C21.5223 12.2009 21.3046 12.4566 21.0156 12.5156L20.8877 12.5283H19.6367C19.6486 12.3541 19.6562 12.1782 19.6562 12.001C19.6562 11.7509 19.6436 11.5037 19.6201 11.2598H20.8877ZM4.37988 11.2598C4.35645 11.5037 4.34375 11.7509 4.34375 12.001C4.34375 12.1782 4.35143 12.3541 4.36328 12.5283H3.12793C2.77777 12.5283 2.49433 12.2446 2.49414 11.8945C2.49414 11.5443 2.77765 11.2598 3.12793 11.2598H4.37988ZM17.8389 5.16504C18.0866 4.91747 18.4877 4.91739 18.7354 5.16504C18.983 5.41269 18.9829 5.81384 18.7354 6.06152L17.7949 7.00098C17.5182 6.68061 17.2172 6.38203 16.8916 6.11133L17.8389 5.16504ZM5.2793 5.16602C5.49614 4.94924 5.83096 4.92215 6.07715 5.08496L6.17578 5.16602L7.11523 6.10547C6.78917 6.37593 6.48711 6.67392 6.20996 6.99414L5.2793 6.06348L5.19824 5.96387C5.03543 5.71765 5.06247 5.38285 5.2793 5.16602ZM12.0078 2.37891C12.3581 2.37891 12.6426 2.66242 12.6426 3.0127V4.37305C12.4307 4.35544 12.2164 4.34473 12 4.34473C11.7892 4.34473 11.5805 4.35438 11.374 4.37109V3.0127C11.374 2.66246 11.6576 2.37897 12.0078 2.37891Z" fill="white"/>
    <circle cx="11.9996" cy="11.9986" r="6.07283" fill="white"/>
  </g>
  <path d="M12.7578 20.7734C12.7578 21.1877 12.422 21.5234 12.0078 21.5234C11.5936 21.5234 11.2578 21.1877 11.2578 20.7734V19.6201C11.5021 19.6436 11.7496 19.6562 12 19.6562C12.2557 19.6562 12.5085 19.6427 12.7578 19.6182V20.7734ZM18.8164 17.6426L18.8682 17.7002C19.1083 17.9947 19.0909 18.4286 18.8164 18.7031C18.5419 18.9777 18.1081 18.995 17.8135 18.7549L17.7559 18.7031L16.918 17.8652C17.3018 17.5431 17.6536 17.1846 17.9678 16.7939L18.8164 17.6426ZM6.03711 16.8008C6.35181 17.1912 6.70358 17.5502 7.08789 17.8721L6.25879 18.7021L6.20117 18.7539C5.90659 18.994 5.47181 18.9767 5.19727 18.7021C4.90476 18.4093 4.90463 17.9344 5.19727 17.6416L6.03711 16.8008ZM20.8887 11.1445L20.9658 11.1475C21.3438 11.1861 21.6387 11.5063 21.6387 11.8945C21.6384 12.2825 21.3437 12.602 20.9658 12.6406L20.8887 12.6445H19.6279C19.6456 12.432 19.6562 12.2171 19.6562 12C19.6562 11.7108 19.6396 11.4254 19.6084 11.1445H20.8887ZM4.3916 11.1445C4.36037 11.4254 4.34375 11.7108 4.34375 12C4.34375 12.2171 4.35435 12.432 4.37207 12.6445H3.12695C2.71289 12.6445 2.3772 12.3085 2.37695 11.8945C2.37695 11.4803 2.71274 11.1445 3.12695 11.1445H4.3916ZM17.7568 5.08203C18.0496 4.78925 18.5245 4.78948 18.8174 5.08203C19.1103 5.37492 19.1103 5.84968 18.8174 6.14258L17.8711 7.08789C17.5494 6.70376 17.191 6.35168 16.8008 6.03711L17.7568 5.08203ZM5.19629 5.08398C5.47088 4.80939 5.90561 4.79195 6.2002 5.03223L6.25684 5.08398L7.20508 6.03223C6.81457 6.34639 6.45489 6.69729 6.13281 7.08105L5.19629 6.14453L5.14551 6.08691C4.90537 5.79248 4.92211 5.35859 5.19629 5.08398ZM12.0078 2.26172C12.396 2.26172 12.7153 2.5566 12.7539 2.93457L12.7578 3.01172V4.38086C12.5085 4.35637 12.2557 4.34375 12 4.34375C11.7496 4.34375 11.502 4.35541 11.2578 4.37891V3.01172C11.2578 2.59751 11.5936 2.26172 12.0078 2.26172Z" fill="white"/>
  <circle cx="11.9996" cy="11.9986" r="6.07283" fill="white"/>
  <defs>
    <filter id="filter0_f_5626_7025" x="0.380027" y="0.264793" width="23.2565" height="23.2556" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="1.05706" result="effect1_foregroundBlur_5626_7025"/>
    </filter>
  </defs>
</svg>` },
    {
      name: 'Dark', value: 'dark', icon: 'dark_mode', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <g filter="url(#filter0_f_5626_7041)">
    <path d="M11.0723 2.5C14.3662 3.33985 16.8027 6.32604 16.8027 9.88184C16.8027 14.0893 13.3916 17.5 9.18457 17.5C6.75613 17.4999 4.595 16.3621 3.2002 14.5918C3.80389 14.7458 4.43625 14.8281 5.08789 14.8281C9.29489 14.8281 12.7061 11.4174 12.7061 7.20996C12.706 5.43118 12.0939 3.79646 11.0723 2.5Z" fill="white"/>
  </g>
  <path d="M11.0723 2.5C14.3662 3.33985 16.8027 6.32604 16.8027 9.88184C16.8027 14.0893 13.3916 17.5 9.18457 17.5C6.75613 17.4999 4.595 16.3621 3.2002 14.5918C3.80389 14.7458 4.43625 14.8281 5.08789 14.8281C9.29489 14.8281 12.7061 11.4174 12.7061 7.20996C12.706 5.43118 12.0939 3.79646 11.0723 2.5Z" fill="white"/>
  <defs>
    <filter id="filter0_f_5626_7041" x="0.700195" y="0" width="18.6025" height="20" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="1.25" result="effect1_foregroundBlur_5626_7041"/>
    </filter>
  </defs>
</svg>` },
    {
      name: 'Black', value: 'black', icon: 'circle', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <g filter="url(#filter0_f_5626_7051)">
    <ellipse cx="10.9865" cy="10.9963" rx="7.51188" ry="7.51188" stroke="url(#paint0_linear_5626_7051)" stroke-width="2.0"/>
  </g>
  <g filter="url(#filter1_f_5626_7051)">
    <ellipse cx="10.9865" cy="10.9963" rx="7.51188" ry="7.51188" stroke="url(#paint1_linear_5626_7051)" stroke-width="0.5"/>
  </g>
  <ellipse cx="10.9865" cy="10.9963" rx="7.51188" ry="7.51188" fill="black" stroke="white" stroke-width="0.3"/>
  <defs>
    <filter id="filter0_f_5626_7051" x="0.224609" y="0.234375" width="21.5234" height="21.5234" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="1.25" result="effect1_foregroundBlur_5626_7051"/>
    </filter>
    <filter id="filter1_f_5626_7051" x="2.72461" y="2.73438" width="16.5234" height="16.5234" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_5626_7051"/>
    </filter>
    <linearGradient id="paint0_linear_5626_7051" x1="18.4984" y1="3.48438" x2="3.47461" y2="18.5081" gradientUnits="userSpaceOnUse">
      <stop stop-color="white"/>
      <stop offset="0.427885" stop-color="white" stop-opacity="0"/>
      <stop offset="1" stop-color="white"/>
    </linearGradient>
    <linearGradient id="paint1_linear_5626_7051" x1="18.4984" y1="3.48438" x2="3.47461" y2="18.5081" gradientUnits="userSpaceOnUse">
      <stop stop-color="white"/>
      <stop offset="0.427885" stop-color="white" stop-opacity="0"/>
      <stop offset="1" stop-color="white"/>
    </linearGradient>
  </defs>
</svg>` }];
  

  /**
   * Constructor.
   * @param document The document object for the current page.
   * @param sanitizer The sanitizer service.
   * @param authenticationService The authentication service.
   */
  public constructor(
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer,
    private authenticationService: AuthenticationService) {

  }
  
  /**
   * Initialize component.
   * 
   * This function is called when the component is loaded.
   * 
   * It sets the SVG for each theme mode and applies the theme based on the user preference.
   * 
   * It also listens to changes in the user preference and applies the theme accordingly.
   */
  public async ngOnInit() {
    for (const element of this.themeModes) {
      element.svg = this.sanitizer.bypassSecurityTrustHtml(element.svg);
    }

    this.preference = this.authenticationService.getPreference();

    switch (this.preference.theme) {
      case 'light':
        this.applyStyle('light.css');
        break;
      case 'dark':
        this.applyStyle('dark.css');
        break;
      case 'black':
        this.applyStyle('black.css');
        break;
      default:
        break;
    }

    // listen to changes to the preference theme
    Cache.onChanges().subscribe(res => {
      if (res?.key === 'preferences') {
        // Check that `res.value.theme` exists and is different than the current theme
        if (res.value.theme && res.value.theme !== this.preference.theme) {
          this.preference.theme = res.value.theme;
          switch (this.preference.theme) {
            case 'light':
              this.applyStyle('light.css');
              break;
            case 'dark':
              this.applyStyle('dark.css');
              break;
            case 'black':
              this.applyStyle('black.css');
              break;
            default:
              break;
          }
        }
      }
    });
  }

/**
 * Applies a CSS stylesheet to the document by updating or creating a link element.
 * 
 * If a link element with the id 'theme' already exists, its href attribute is updated
 * with the provided styleName. Otherwise, a new link element is created, configured, 
 * and appended to the document's head.
 * 
 * @param styleName - The name of the stylesheet file to apply.
 */

  public applyStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];
    let themeLink = this.document.getElementById('theme') as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = styleName;
    }
    else {
      const style = this.document.createElement('link');
      style.id = 'theme';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;
      head.appendChild(style);
    }
  }


  /**
   * Updates the user preference with the selected theme mode and applies the corresponding stylesheet.
   * 
   * This function sets the theme preference to the value of the passed mode object,
   * applies the appropriate stylesheet using the `applyStyle` method, and updates
   * the preference through the authentication service.
   * 
   * @param mode - An object containing the theme mode details, including its name, value, and icon.
   */

  public selectTheme(mode: { name: string, value: string, icon: string }): void {
    this.preference.theme = mode.value;
    this.applyStyle(`${this.preference?.theme || 'light'}.css`);
    this.authenticationService.setPreference(this.preference);
  }
}
