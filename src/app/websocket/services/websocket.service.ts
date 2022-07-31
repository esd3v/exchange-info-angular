import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { API_WEBSOCKET_BASEURL } from 'src/app/shared/config';

type Status = 'opened' | 'connecting' | 'closed' | 'closing' | 'failed' | null;

@Injectable()
export class WebsocketService<T> {
  private socket$!: WebSocketSubject<any>;
  private _messages$ = new Subject<T>();
  private _status$ = new Subject<Status>();

  public get messages$() {
    return this._messages$;
  }

  public get status$() {
    return this._status$;
  }

  constructor() {}

  connect(): void {
    const url = API_WEBSOCKET_BASEURL;

    this.status$.next('connecting');

    this.socket$ = new WebSocketSubject({
      url,
      openObserver: {
        next: () => {
          this.status$.next('opened');
        },
      },
      closeObserver: {
        next: () => {
          this.status$.next('closed');
        },
      },
      closingObserver: {
        next: () => {
          this.status$.next('closing');
        },
      },
    });

    this.socket$.subscribe({
      next: (message) => {
        this._messages$.next(message);
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  close() {
    this.socket$.complete();
    this.status$.complete();
  }

  send(msg: string | Record<string, any>): void {
    this.status$.subscribe((status) => {
      if (status === 'opened') {
        this.socket$.next(msg);
      }
    });
  }

  ngOnDestroy() {
    this.close();
  }
}
