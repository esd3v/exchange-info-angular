export interface WebsocketMessageStreamParams {
  method: 'SUBSCRIBE' | 'UNSUBSCRIBE';
  params: string[];
  id: number;
}
