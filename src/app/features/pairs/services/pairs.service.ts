import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, filter, first, map } from 'rxjs';
import { getCellByColumnId, parsePair } from 'src/app/shared/helpers';
import { Column } from 'src/app/shared/models/column';
import { Row } from 'src/app/shared/models/row.model';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { TickerWebsocketService } from '../../tickers/services/ticker-websocket.service';

@Injectable({ providedIn: 'root' })
export class PairsService {
  public subscribedSymbols: string[] = [];
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);

  public constructor(
    private store: Store<AppState>,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  private createSymbolsFromRows = (columns: Column[], rows: Row[]) => {
    return rows.map((row) => {
      const pairCell = getCellByColumnId({ columns, id: 'pair', row });
      const { base, quote } = parsePair(pairCell.value as string, '/');

      return `${base}${quote}`;
    });
  };

  private createSymbolsFromCurrentPageRows$(
    columns: Column[],
    pageData$: BehaviorSubject<Row[]>
  ) {
    return pageData$.pipe(
      first(),
      map((rows) => this.createSymbolsFromRows(columns, rows))
    );
  }

  public subscribeToPageSymbols(
    columns: Column[],
    pageData$: BehaviorSubject<Row[]>
  ) {
    const symbols$ = this.createSymbolsFromCurrentPageRows$(
      columns,
      pageData$
    ).pipe(filter((symbols) => Boolean(symbols.length)));

    this.globalSymbol$
      .pipe(first(), filter(Boolean))
      .subscribe((globalSymbol) => {
        symbols$
          .pipe(
            // Exclude globalSymbol because we already subscribed to it
            map((symbols) =>
              symbols.filter((symbol) => symbol !== globalSymbol)
            )
          )
          .subscribe((symbols) => {
            this.subscribedSymbols = symbols;

            this.tickerWebsocketService.subscribeToWebsocket(
              { symbols },
              this.tickerWebsocketService.websocketSubscriptionId.subscribe
                .multiple
            );
          });
      });
  }

  public unsubscribeFromPageSymbols() {
    this.tickerWebsocketService.unsubscribeFromWebsocket(
      {
        symbols: this.subscribedSymbols,
      },
      this.tickerWebsocketService.websocketSubscriptionId.unsubscribe.multiple
    );

    this.subscribedSymbols = [];
  }
}
