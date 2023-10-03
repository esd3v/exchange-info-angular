import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { convertPairToCurrency } from 'src/app/shared/helpers';
import { TradeService } from './trade.service';

@Injectable({
  providedIn: 'root',
})
export class TradeGuard {
  constructor(private tradeService: TradeService) {}

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    const pair = activatedRouteSnapshot.paramMap.get('pair');

    if (!pair) {
      this.tradeService.navigateToDefaultPair();

      return false;
    }

    const { base, quote } = convertPairToCurrency(pair, '_');

    // e.g "ETH_" or "_BTC"
    if (!base || !quote) {
      this.tradeService.navigateToDefaultPair();

      return false;
    }

    return true;
  }
}
