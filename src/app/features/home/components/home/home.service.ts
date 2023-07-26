import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CandlesService } from 'src/app/features/candles/services/candles.service';
import { OrderBookService } from 'src/app/features/order-book/services/order-book.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { MISC_SNACKBAR_DURATION } from 'src/app/shared/config';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalService } from '../../../global/services/global.service';
import { TradesService } from '../../../trades/services/trades.service';

@Injectable({ providedIn: 'root' })
export class HomeService {
  constructor(
    private globalService: GlobalService,
    private router: Router,
    private orderBookService: OrderBookService,
    private tradesService: TradesService,
    private snackBar: MatSnackBar,
    private websocketService: WebsocketService,
    private tickerService: TickerService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private candlesService: CandlesService
  ) {}

  navigateToDefaultPair() {
    this.router.navigate([this.globalService.pairUnderscore]);
  }

  #openSnackBar(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: MISC_SNACKBAR_DURATION,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  onWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      this.websocketSubscribeService.handleWebsocketMessage(data)({
        onData: (data) => {
          if ('e' in data) {
            if (data.e === 'kline') {
              this.candlesService.handleWebsocketData(data);
            } else if (data.e === '24hrTicker') {
              this.tickerService.handleWebsocketData(data);
            } else if (data.e === 'trade') {
              this.tradesService.handleWebsocketData(data);
            }
          } else {
            if ('lastUpdateId' in data) {
              this.orderBookService.handleWebsocketData(data);
            }
          }
        },
        // onSubscribe(id) {
        //   console.log('subscribed', id);
        // },
        // onUnsubscribe(id) {
        //   console.log('unsubscribed', id);
        // },
      });
    });
  }

  onWebsocketStatus() {
    combineLatest([
      this.websocketService.status$,
      this.websocketService.reason$,
    ]).subscribe(([status, reason]) => {
      if (status === 'connecting') {
        this.#openSnackBar('Connecting to WebSocket server...');
      } else if (status === 'closed') {
        if (reason === 'terminated') {
          this.#openSnackBar('WebSocket connection terminated');
        } else {
          this.#openSnackBar('WebSocket connection closed');
        }
      } else if (status === 'closing') {
        this.#openSnackBar('Closing WebSocket connection...');
      } else if (status === 'open') {
        this.#openSnackBar('WebSocket connection has been opened');
      }
    });
  }

  startWebSocket() {
    this.websocketService.connect();
  }
}
