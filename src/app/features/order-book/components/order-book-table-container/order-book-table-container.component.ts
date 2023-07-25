import { Component, OnInit } from '@angular/core';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBookColumn } from '../../types/order-book-column';
import { OrderBookTableContainerService } from './order-book-table-container.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-order-book-table-container',
  templateUrl: './order-book-table-container.component.html',
})
export class OrderBookTableContainerComponent implements OnInit {
  asksData: Row[] = [];

  bidsData: Row[] = [];

  columns: OrderBookColumn[] = [];

  placeholderRowsCount = WIDGET_DEPTH_DEFAULT_LIMIT;

  get loading() {
    return this.orderBookTableContainerService.loadingController.loading;
  }

  constructor(
    private orderBookTableContainerService: OrderBookTableContainerService,
    private websocketService: WebsocketService
  ) {}

  #createColumns({ base, quote }: Currency): OrderBookColumn[] {
    return [
      {
        id: 'price',
        numeric: false,
        label: `Price${quote ? ` (${quote})` : ''}`,
      },
      {
        id: 'amount',
        numeric: true,
        label: `Amount${base ? ` (${base})` : ''}`,
      },
      {
        id: 'total',
        numeric: true,
        label: 'Total',
      },
    ];
  }

  ngOnInit(): void {
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === null) {
        // Load REST data only if we start the app with websockets disabled
        this.orderBookTableContainerService.loadData();
      }
    });

    this.orderBookTableContainerService.onWebsocketOpen();
    this.orderBookTableContainerService.onRestLoading();
    this.orderBookTableContainerService.onRestAndDataComplete();

    this.orderBookTableContainerService.currency$.subscribe((currency) => {
      this.columns = this.#createColumns(currency);
    });

    this.orderBookTableContainerService.asksData$.subscribe((data) => {
      this.asksData = data;
    });

    this.orderBookTableContainerService.bidsData$.subscribe((data) => {
      this.bidsData = data;
    });
  }
}
