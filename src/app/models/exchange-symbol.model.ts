import { OrderTypes, SymbolStatus, SymbolFilters } from '.';

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
