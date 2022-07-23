import { ExchangeSymbol, SymbolStatus } from '.';

export interface ExchangeInfoParsed {
  baseAsset: string;
  quoteAsset: string;
  serverTime: number;
  symbolInfo: Pick<
    ExchangeSymbol,
    'symbol' | 'baseAsset' | 'quoteAsset' | 'status'
  >[];
}
