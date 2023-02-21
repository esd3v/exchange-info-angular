import { OrderTypes } from './oder-types';
import {
  PriceFilter,
  PercentPriceFilter,
  LotSizeFilter,
  MinNotionalFilter,
  IcebergPartsFilter,
  MarketLotSizeFilter,
  MaxNumOrdersFilter,
  MaxNumAlgoOrdersFilter,
  MaxPositionFilter,
} from './symbol-filters';
import { SymbolStatus } from './symbol-status';

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
  filters: (
    | PriceFilter
    | PercentPriceFilter
    | LotSizeFilter
    | MinNotionalFilter
    | IcebergPartsFilter
    | MarketLotSizeFilter
    | MaxNumOrdersFilter
    | MaxNumAlgoOrdersFilter
    | MaxPositionFilter
  )[];
  permissions: ('SPOT' | 'MARGIN')[];
}
