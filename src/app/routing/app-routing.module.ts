import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './routes';
import { TradeModule } from '../features/trade/trade.module';

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), TradeModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
