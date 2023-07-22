import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  filter,
  first,
  interval,
  switchMap,
  takeUntil,
  timer,
} from 'rxjs';
import { TOKEN_WEBSOCKET_CONFIG } from '../injection-tokens';
import { WebsocketModule } from '../websocket.module';
import { WebsocketConfig } from '../types/websocket-config';

type WebsocketStatus = 'open' | 'connecting' | 'closed' | 'closing' | null;

export type Reason =
  | 'failed'
  | 'terminated'
  | 'restoring'
  | 'restored'
  | 'switch'
  | null;

@Injectable({
  providedIn: WebsocketModule,
})
export class WebsocketService implements OnDestroy {
  #socket!: WebSocket | null;
  #messages$ = new Subject<MessageEvent<string>>();
  #status!: WebsocketStatus;
  #reason!: Reason;
  #reason$ = new BehaviorSubject<Reason>(null);
  #status$ = new BehaviorSubject<WebsocketStatus>(null);

  public get messages$() {
    return this.#messages$;
  }

  public get status() {
    return this.#status;
  }

  public get reason() {
    return this.#reason;
  }

  public get status$() {
    return this.#status$;
  }

  public get reason$() {
    return this.#reason$;
  }

  public constructor(
    @Inject(TOKEN_WEBSOCKET_CONFIG) private config: WebsocketConfig
  ) {
    this.#status$.subscribe((status) => {
      this.#status = status;
    });

    this.#reason$.subscribe((reason) => {
      this.#reason = reason;
    });
  }

  #keepAlive() {
    if (this.config.keepAlive?.msec) {
      const stop$ = this.#status$.pipe(filter((status) => status === 'open'));

      interval(this.config.keepAlive.msec)
        .pipe(takeUntil(stop$))
        .subscribe(() => {
          if (this.config.keepAlive?.message) {
            this.send(this.config.keepAlive.message);
          }
        });
    }
  }

  public close(reason: Reason) {
    // Close websocket only of status is currently open
    // because we also can close it by switch
    // when if it's currently closed (with terminated reason) and attempting to reconnect
    if (this.status === 'open') {
      this.#status$.next('closing');
      this.#socket?.close();
    }

    this.#reason$.next(reason);
  }

  public send(msg: string | Record<string, any>): void {
    if (this.#status === 'open') {
      this.#socket?.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }

  public ngOnDestroy() {
    this.close(null);
  }

  public connect(reason?: Reason) {
    console.time('WS');
    this.#status$.next('connecting');

    this.#reason$.next(
      reason || (this.#reason === 'terminated' ? 'restoring' : this.#reason)
    );

    this.#socket = new WebSocket(this.config.url);

    this.#socket.onopen = () => {
      console.timeEnd('WS');
      this.#status$.next('open');

      this.#reason$.next(
        this.#reason === 'restoring' ? 'restored' : this.#reason
      );

      if (this.config.keepAlive) {
        this.#keepAlive();
      }
    };

    this.#socket.onmessage = (event) => {
      this.messages$.next(event);
    };

    this.#socket.onerror = () => {
      this.#status$.next('closed');
      this.#reason$.next('failed');
    };

    this.#socket.onclose = () => {
      // If terminated by server
      if (this.#status === 'open') {
        this.#status$.next('closed');
        this.#reason$.next('terminated');

        if (this.config.reconnect) {
          timer(this.config.reconnect)
            .pipe(
              switchMap(() =>
                // Check if reason is still 'terminated'
                // e.g it wasn't switched off by websocket switch
                this.reason$.pipe(
                  first(),
                  filter((reason) => reason === 'terminated')
                )
              )
            )
            .subscribe(() => {
              this.connect();
            });
        }
      } else {
        this.#status$.next('closed');
      }
    };

    return this.#status$;
  }
}
