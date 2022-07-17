import { SymbolStatus } from '.';

export interface ExchangeInfoParsed {
  baseAsset: string;
  quoteAsset: string;
  serverTime: number;
  symbolInfo: {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: SymbolStatus;
  }[];
}
