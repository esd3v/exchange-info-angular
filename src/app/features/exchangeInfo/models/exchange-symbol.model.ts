import { OrderTypes } from './oder-types.model';
import { SymbolFilters } from './symbol-filters.model';
import { SymbolStatus } from './symbol-status.model';

export interface ExchangeSymbol {
  symbol: string;
  status: SymbolStatus;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  baseCommissionPrecision: number;
  quoteCommissionPrecision: number;
  orderTypes: OrderTypes[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  quoteOrderQtyMarketAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: SymbolFilters;
  permissions: ('SPOT' | 'MARGIN')[];
}
