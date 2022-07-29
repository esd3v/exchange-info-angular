export type Filter<
  filterType extends
    | 'PRICE_FILTER'
    | 'PERCENT_PRICE'
    | 'LOT_SIZE'
    | 'MIN_NOTIONAL'
    | 'ICEBERG_PARTS'
    | 'MARKET_LOT_SIZE'
    | 'MAX_NUM_ORDERS'
    | 'MAX_NUM_ALGO_ORDERS'
    | 'MAX_NUM_ICEBERG_ORDERS'
    | 'MAX_POSITION'
    | 'EXCHANGE_MAX_NUM_ORDERS'
    | 'EXCHANGE_MAX_NUM_ALGO_ORDERS',
  T extends Record<string, any>
> = {
  filterType: filterType;
} & T;
