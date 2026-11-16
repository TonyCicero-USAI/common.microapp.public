// OPEN SOURCE

import { Inject } from '@angular/core';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkMenuModule } from '@angular/cdk/menu';

import { DOCUMENT } from '@angular/common';

import { ChartModule } from 'angular-highcharts';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { NgIdleKeepaliveModule, provideNgIdleKeepalive } from '@ng-idle/keepalive';

import config from '@app/app';
import { Cache } from '@src/shared/objects/cache';

import { MainComponent } from '@src/main/main.component';
import { MaterialModule } from '@src/shared/material.module';
import { PrivateComponent } from '@app/private/private.component';
import { PublicComponent } from '@app/public/public.component';
import { SharedModule } from '@src/shared/shared.module';

import { BannerComponent } from '@src/main/core/banner/banner.component';
import { CustomReuseStrategy } from '@src/shared/routing/routing';
import { ErrorComponent } from '@src/main/core/error/error.component';
import { FooterComponent } from '@src/main/core/footer/footer.component';
import { GlobalErrorHandler } from '@src/shared/objects/global-error-handler';
import { HeaderComponent } from '@src/main/core/header/header.component';
import { LogoutComponent } from '@src/main/core/logout/logout.component';
import { NavigationComponent } from '@src/main/core/navigation/navigation.component';
import { NotFoundComponent } from '@src/main/core/not-found/not-found.component';
import { SigninComponent } from '@src/main/core/signin/signin.component';
import { StartupSpinnerComponent } from '@src/shared/components/startup-spinner/startup-spinner.component';
import { TimeoutComponent } from '@src/main/core/timeout/timeout.component';
import { ThemePickerComponent } from '@src/main/core/_/theme-picker/theme-picker.component';

import { AbstractService } from '@src/shared/services/abstract.service';
import { SecurityService } from '@src/shared/services/security.service';

const routes: Routes = [
    { path: 'logout', component: LogoutComponent, pathMatch: 'full' },
    { path: 'private', component: PrivateComponent, loadChildren: () => import('@app/private/private.module').then(m => m.PrivateModule) },
    { path: 'public', component: PublicComponent, loadChildren: () => import('@app/public/public.module').then(m => m.PublicModule) },
    { path: 'signin', component: SigninComponent, pathMatch: 'full' },
    { path: 'timeout', component: TimeoutComponent, pathMatch: 'full' },
    { path: '**', component: NotFoundComponent }
];

@NgModule({
    declarations: [
        BannerComponent,
        ErrorComponent,
        FooterComponent,
        HeaderComponent,
        LogoutComponent,
        MainComponent,
        NavigationComponent,
        NotFoundComponent,
        SigninComponent,
        StartupSpinnerComponent,
        ThemePickerComponent,
        TimeoutComponent,
    ],
    exports: [
        BannerComponent,
        HeaderComponent,
        NavigationComponent
    ],
    bootstrap: [
        MainComponent
    ],
    imports: [
        A11yModule,
        BrowserModule,
        BrowserAnimationsModule,
        CdkMenuModule,
        CommonModule,
        OverlayModule,
        ChartModule,
        FormsModule,
        MaterialModule,
        SharedModule.forRoot(),
        NgIdleKeepaliveModule.forRoot(), // use NgIdleModule.forRoot() if not using keepalive
        ReactiveFormsModule,
        RouterModule.forRoot(routes, {})
    ],
    providers: [
        AbstractService,
        SecurityService,
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {
                showDelay: 0,
                hideDelay: 0,
                touchendHideDelay: 1500,
                disableTooltipInteractivity: false
            } as MatTooltipDefaultOptions
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideNgIdleKeepalive(), // use provideNgIdle() if not using keepalive
    ] })

/**
 * The main module is the primary module that is first loaded by the
 * application. The main module defines a set of common routes and then
 * delegates the '' route to the application that is built on top of
 * the common code infrastructure.
 */
export class MainModule {

    public theme: string; // the them for the app
    /**
     * Constructor.
     */
    public constructor(

        @Inject(DOCUMENT) private document: Document,
        private overlayContainer: OverlayContainer,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer) {
        
        // Set default font for mat-icon
        this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

        // Register custom SVG to mat-icon library
        this.matIconRegistry.addSvgIcon(
            "us_edit",
            this.domSanitizer.bypassSecurityTrustResourceUrl("assets/icons/edit.svg")
        );
        this.matIconRegistry.addSvgIcon(
            "us_delete",
            this.domSanitizer.bypassSecurityTrustResourceUrl("assets/icons/delete.svg")
        );


        // Add app name to overlay for easy CSS control
        const appName = config.appName.replace(/\s/g, '') || '';
        overlayContainer.getContainerElement().classList.add('app-custom-theme', appName);

        const cache = Cache.get();
        const theme = <string>(cache.getValue(Cache.KEYS.PREFERENCE)?.theme) || 'light';
        const html = this.document.querySelector('html');
        this.setTheme(theme, html);

        Cache.changeObservable.subscribe((x: { key: string, value }) => {
            if (x.key === 'preferences') {
                const themeValue = x.value?.theme || 'light';
                this.setTheme(themeValue, html);
            }
        });
    }

    /**
     * Add theme to HTML tags
     * @param theme Theme name
     * @param html HTML tag
     */
    private setTheme(theme: string, html: HTMLHtmlElement): void {
        this.theme = `${theme}-theme`;
        html.dataset.theme = this.theme;
        this.overlayContainer.getContainerElement().classList.remove('light-theme', 'dark-theme', 'black-theme');
        this.overlayContainer.getContainerElement().classList.add(this.theme);
    }
}
