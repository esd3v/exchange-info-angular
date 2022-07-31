import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../routing/app-routing.module';
import { InterceptorService } from './services/interceptor.service';
import { AppStoreModule } from '../store/store.module';
import { WebsocketModule } from '../websocket/websocket.module';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppStoreModule,
    HttpClientModule,
    WebsocketModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    Title,
  ],
  exports: [AppRoutingModule],
})
export class CoreModule {
  public constructor(@SkipSelf() @Optional() parent: CoreModule) {
    if (parent) {
      throw new Error(`${parent.constructor.name} has already been loaded.`);
    }
  }
}
