import { Inject, Injectable } from '@angular/core';
import { interval, Subject, takeWhile } from 'rxjs';
import { TOKEN_WEBSOCKET_CONFIG, WebsocketConfig } from '../websocket-config';

type Status =
  | 'open'
  | 'connecting'
  | 'closed'
  | 'closing'
  | 'failed'
  | 'terminated'
  | 'restoring'
  | 'restored'
  | null;

@Injectable()
export class WebsocketService {
  constructor(@Inject(TOKEN_WEBSOCKET_CONFIG) private config: WebsocketConfig) {
    this.status$.subscribe((status) => {
      this.status = status;
    });
  }

  private socket!: WebSocket | null;
  private _messages$ = new Subject<MessageEvent<string>>();
  private status!: Status;
  private _status$ = new Subject<Status>();

  public get messages$() {
    return this._messages$;
  }

  public get status$() {
    return this._status$;
  }

  connect(): void {
    this.status$.next(
      this.status === 'terminated' ? 'restoring' : 'connecting'
    );
    this.socket = new WebSocket(this.config.url);

    this.socket.onopen = () => {
      this.status$.next(this.status === 'restoring' ? 'restored' : 'open');

      if (this.config.keepAlive) {
        this.keepAlive();
      }
    };

    this.socket.onmessage = (event) => {
      this.messages$.next(event);
    };

    this.socket.onerror = (event) => {
      this.status$.next('failed');
    };

    this.socket.onclose = (event) => {
      // If terminated by server
      if (this.status === 'open') {
        this.status$.next('terminated');

        if (this.config.reconnect) {
          this.reconnect();
        }
        // If closing manually
      } else if (this.status === 'closing') {
        this.status$.next('closed');
      }

      this.messages$.complete();
    };
  }

  private keepAlive() {
    if (this.config.keepAlive?.msec) {
      interval(this.config.keepAlive.msec)
        .pipe(
          takeWhile(() => this.status === 'open' || this.status === 'restored')
        )
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
        .pipe(takeWhile(() => this.status === 'terminated'))
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
