import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../routing/app-routing.module';
import { InterceptorService } from './services/interceptor.service';
import { AppStoreModule } from '../store/store.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { API_WEBSOCKET_BASEURL } from '../shared/config';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppStoreModule,
    HttpClientModule,
    WebsocketModule.forRoot({
      url: API_WEBSOCKET_BASEURL,
      reconnect: 3000,
    }),
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
  constructor(@SkipSelf() @Optional() parent: CoreModule) {
    if (parent) {
      throw new Error(`${parent.constructor.name} has already been loaded.`);
    }
  }
}
