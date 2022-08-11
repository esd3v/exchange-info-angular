import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subject, takeWhile } from 'rxjs';
import { TOKEN_WEBSOCKET_CONFIG, WebsocketConfig } from '../websocket-config';

type Status = 'open' | 'connecting' | 'closed' | 'closing' | null;

type Reason = 'failed' | 'terminated' | 'restoring' | 'restored' | null;

@Injectable()
export class WebsocketService {
  constructor(@Inject(TOKEN_WEBSOCKET_CONFIG) private config: WebsocketConfig) {
    this.status$.subscribe((status) => {
      // TODO REMOVE
      console.log(status);

      this.status = status;
    });

    this.reason$.subscribe((reason) => {
      // TODO REMOVE
      console.log(reason);

      this.reason = reason;
    });
  }

  private socket!: WebSocket | null;
  private _messages$ = new Subject<MessageEvent<string>>();
  private status!: Status;
  private reason!: Reason;
  public reason$ = new BehaviorSubject<Reason>(null);
  public status$ = new BehaviorSubject<Status>(null);

  public get messages$() {
    return this._messages$;
  }

  connect(): void {
    this.status$.next('connecting');
    this.reason$.next(this.reason === 'terminated' ? 'restoring' : this.reason);
    this.socket = new WebSocket(this.config.url);

    this.socket.onopen = () => {
      this.status$.next('open');
      this.reason$.next(this.reason === 'restoring' ? 'restored' : this.reason);

      if (this.config.keepAlive) {
        this.keepAlive();
      }
    };

    this.socket.onmessage = (event) => {
      this.messages$.next(event);
    };

    this.socket.onerror = () => {
      this.status$.next('closed');
      this.reason$.next('failed');
    };

    this.socket.onclose = (event) => {
      // If terminated by server
      if (this.status === 'open') {
        this.reason$.next('terminated');

        if (this.config.reconnect) {
          this.reconnect();
        }
      }

      this.status$.next('closed');
    };
  }

  private keepAlive() {
    if (this.config.keepAlive?.msec) {
      interval(this.config.keepAlive.msec)
        .pipe(takeWhile(() => this.status === 'open'))
        .subscribe(() => {
          if (this.config.keepAlive?.message) {
            this.send(this.config.keepAlive.message);
          }
        });
    }
  }

  private reconnect() {
    if (this.config.reconnect) {
      interval(this.config.reconnect)
        .pipe(
          takeWhile(
            () => this.status === 'closed' && this.reason === 'terminated'
          )
        )
        .subscribe(() => {
          this.connect();
        });
    }
  }

  close() {
    this.status$.next('closing');
    this.socket?.close();
  }

  send(msg: string | Record<string, any>): void {
    this.socket?.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  ngOnDestroy() {
    this.close();
  }
}
