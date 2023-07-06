export interface WithWebsocket<T> {
  createParams(params: T): string[];
  subscribe(params: T, customId: number): void;
  unsubscribe?(params: T, customId: number): void;
}
