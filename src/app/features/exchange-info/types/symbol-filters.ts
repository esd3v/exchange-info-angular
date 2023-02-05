import { Filter } from './filter';

export type SymbolFilters = [
  Filter<
    'PRICE_FILTER',
    {
      minPrice: string;
      maxPrice: string;
      tickSize: string;
    }
  >,
  Filter<
    'PERCENT_PRICE',
    {
      multiplierUp: string;
      multiplierDown: string;
      avgPriceMins: number;
    }
  >,
  Filter<
    'LOT_SIZE',
    {
      minQty: string;
      maxQty: string;
      stepSize: string;
    }
  >,
  Filter<
    'MIN_NOTIONAL',
    {
      minNotional: string;
      applyToMarket: boolean;
      avgPriceMins: number;
    }
  >,
  Filter<
    'ICEBERG_PARTS',
    {
      limit: number;
    }
  >,
  Filter<
    'MARKET_LOT_SIZE',
    {
      minQty: string;
      maxQty: string;
      stepSize: string;
    }
  >,
  Filter<
    'MAX_NUM_ORDERS',
    {
      maxNumOrders: number;
    }
  >,
  Filter<
    'MAX_NUM_ALGO_ORDERS',
    {
      maxNumIcebergOrders: number;
    }
  >,
  Filter<
    'MAX_POSITION',
    {
      maxPosition: string;
    }
  >
];
