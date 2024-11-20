import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';
import { StoreMapperComponent } from './store-mapper/store-mapper.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent,StoreMapperComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    GoogleMapsModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
 // Leave this empty to manually bootstrap as a web component
})
export class AppModule {
  constructor(private injector: Injector) {
    // Register StoreMapperComponent as a custom element
    const storeMapperElement = createCustomElement(StoreMapperComponent, { injector: this.injector });
    customElements.define('app-root', storeMapperElement);
  }

  ngDoBootstrap() {}  // Disable Angular's automatic bootstrapping
}
