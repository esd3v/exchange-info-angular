import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, interval, Subject, takeUntil } from 'rxjs';
import { TOKEN_WEBSOCKET_CONFIG, WebsocketConfig } from '../websocket-config';

type WebsocketStatus = 'open' | 'connecting' | 'closed' | 'closing' | null;

export type Reason =
  | 'failed'
  | 'terminated'
  | 'restoring'
  | 'restored'
  | 'switch'
  | null;

@Injectable()
export class WebsocketService implements OnDestroy {
  private socket!: WebSocket | null;
  private _messages$ = new Subject<MessageEvent<string>>();
  private status!: WebsocketStatus;
  private reason!: Reason;

  public reason$ = new BehaviorSubject<Reason>(null);
  public status$ = new BehaviorSubject<WebsocketStatus>(null);

  public get messages$() {
    return this._messages$;
  }

  public constructor(
    @Inject(TOKEN_WEBSOCKET_CONFIG) private config: WebsocketConfig
  ) {
    this.status$.subscribe((status) => {
      this.status = status;
    });

    this.reason$.subscribe((reason) => {
      this.reason = reason;
    });
  }

  private keepAlive() {
    if (this.config.keepAlive?.msec) {
      const stop$ = this.status$.pipe(filter((status) => status === 'open'));

      interval(this.config.keepAlive.msec)
        .pipe(takeUntil(stop$))
        .subscribe(() => {
          if (this.config.keepAlive?.message) {
            this.send(this.config.keepAlive.message);
          }
        });
    }
  }

  private reconnect() {
    if (this.config.reconnect) {
      const stop$ = this.status$.pipe(filter((status) => status === 'open'));

      interval(this.config.reconnect)
        .pipe(takeUntil(stop$))
        .subscribe(() => {
          this.connect();
        });
    }
  }

  public close() {
    this.status$.next('closing');
    this.socket?.close();
  }

  public send(msg: string | Record<string, any>): void {
    this.socket?.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }

  public ngOnDestroy() {
    this.close();
  }

  public connect(reason?: Reason) {
    this.status$.next('connecting');

    this.reason$.next(
      reason || (this.reason === 'terminated' ? 'restoring' : this.reason)
    );

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

    this.socket.onclose = () => {
      // If terminated by server
      if (this.status === 'open') {
        this.reason$.next('terminated');

        if (this.config.reconnect) {
          this.reconnect();
        }
      }

      this.status$.next('closed');
    };

    return this.status$;
  }
}
