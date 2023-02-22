import { Filter } from './filter';

export type PriceFilter = Filter<
  'PRICE_FILTER',
  {
    minPrice: string;
    maxPrice: string;
    tickSize: string;
  }
>;

export type PercentPriceFilter = Filter<
  'PERCENT_PRICE',
  {
    multiplierUp: string;
    multiplierDown: string;
    avgPriceMins: number;
  }
>;

export type LotSizeFilter = Filter<
  'LOT_SIZE',
  {
    minQty: string;
    maxQty: string;
    stepSize: string;
  }
>;

export type MinNotionalFilter = Filter<
  'MIN_NOTIONAL',
  {
    minNotional: string;
    applyToMarket: boolean;
    avgPriceMins: number;
  }
>;

export type IcebergPartsFilter = Filter<
  'ICEBERG_PARTS',
  {
    limit: number;
  }
>;

export type MarketLotSizeFilter = Filter<
  'MARKET_LOT_SIZE',
  {
    minQty: string;
    maxQty: string;
    stepSize: string;
  }
>;

export type MaxNumOrdersFilter = Filter<
  'MAX_NUM_ORDERS',
  {
    maxNumOrders: number;
  }
>;

export type MaxNumAlgoOrdersFilter = Filter<
  'MAX_NUM_ALGO_ORDERS',
  {
    maxNumIcebergOrders: number;
  }
>;

export type MaxPositionFilter = Filter<
  'MAX_POSITION',
  {
    maxPosition: string;
  }
>;
