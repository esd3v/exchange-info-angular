import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  mergeMap,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTrades } from '../models/websocket-trades.model';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { TradesRestService } from './trades-rest.service';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private websocketStatus$ = this.websocketService.status$;
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private tradesStatus$ = this.store$.select(tradesSelectors.status);

  private websocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private store$: Store<AppState>,
    private websocketService: WebsocketService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof tradesActions.load>[0], 'symbol'>) {
    const status$ = this.tradesRestService.loadData({ symbol });
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
      this.tradesWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.tradesWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }

  public onWebsocketOpen() {
    const stop$ = new Subject<void>();

    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.tradesStatus$.pipe(
              filter((status) => status === 'success'),
              takeUntil(stop$)
            ),
            this.globalSymbol$.pipe(filter(Boolean), takeUntil(stop$)),
          ]);
        }),
        tap(() => {
          stop$.next();
        })
      )
      .subscribe(([_tickerStatus, symbol]) => {
        this.tradesWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    const trades: TradesEntity = {
      price: p,
      qty: q,
      isBuyerMaker: m,
      time: T,
    };

    this.store$.dispatch(tradesActions.add({ trades }));
    this.store$.dispatch(tradesActions.removeLast());
  }
}
