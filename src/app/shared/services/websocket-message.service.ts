export abstract class WebsocketMessageService {
  private _subscribed = false;

  public get subscribed() {
    return this._subscribed;
  }

  public set subscribed(value) {
    this._subscribed = value;
  }

  public abstract subscribe(params: any): any;
  public abstract unsubscribe(params: any): any;
  public abstract handleIncomingMessage(params: any): any;
}
