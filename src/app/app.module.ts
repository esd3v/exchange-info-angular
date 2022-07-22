import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppStoreModule } from './store/store.module';
import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InterceptorService } from './services/interceptor.service';
import { HeaderComponent } from './components/header/header.component';
import { TickerCardComponent } from './components/ticker-card/ticker-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TickerGroupComponent } from './components/ticker-group/ticker-group.component';
import { TickerPairComponent } from './components/ticker-pair/ticker-pair.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { TickerLastPriceComponent } from './components/ticker-last-price/ticker-last-price.component';
import { FormatLastPricePipe } from './pipes/format-last-price.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SkeletonComponent,
    HeaderComponent,
    TickerCardComponent,
    TickerGroupComponent,
    TickerPairComponent,
    TickerLastPriceComponent,
    FormatLastPricePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppStoreModule,
    HttpClientModule,
    MatToolbarModule,
    MatCardModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    Title,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
