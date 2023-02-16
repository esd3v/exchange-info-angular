export interface WithWebsocket<T> {
  createParams(params: T): string[];
  subscribe(params: T, manualId: number): void;
  unsubscribe?(params: T): void;
}
