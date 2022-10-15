export type WebsocketOrderBook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};
