import { Filter } from '.';

export type ExchangeFilters = [
  Filter<
    'EXCHANGE_MAX_NUM_ORDERS',
    {
      maxNumOrders: number;
    }
  >,
  Filter<
    'EXCHANGE_MAX_NUM_ALGO_ORDERS',
    {
      maxNumAlgoOrders: number;
    }
  >
];
