import { TickerEffects } from './store/ticker/ticker.effects';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { InterceptorService } from './services/interceptor.service';
import { HeaderComponent } from './components/header/header.component';
import { TickerCardComponent } from './components/ticker-card/ticker-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TickerGroupComponent } from './components/ticker-group/ticker-group.component';
import { TickerPairComponent } from './components/ticker-pair/ticker-pair.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { TickerLastPriceComponent } from './components/ticker-last-price/ticker-last-price.component';
import { TickerChangeComponent } from './components/ticker-change/ticker-change.component';
import { FormatLastPricePipe } from './pipes/format-last-price.pipe';
import { TickerChangePercentComponent } from './components/ticker-change-percent/ticker-change-percent.component';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';
import { TickerLastQuantityComponent } from './components/ticker-last-quantity/ticker-last-quantity.component';
import { TickerTradesComponent } from './components/ticker-trades/ticker-trades.component';
import { EffectsModule } from '@ngrx/effects';
import { WindowComponent } from './components/window/window.component';
import { ExchangeInfoEffects } from './store/exchangeInfo/exchangeInfo.effects';
import { PairsComponent } from './components/pairs/pairs.component';
import { CoreModule } from './core/core.module';

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
    TickerChangeComponent,
    FormatLastPricePipe,
    TickerChangePercentComponent,
    FormatPriceChangePercentPipe,
    TickerLastQuantityComponent,
    TickerTradesComponent,
    WindowComponent,
    PairsComponent,
  ],
  imports: [
    CoreModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatDividerModule,
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
