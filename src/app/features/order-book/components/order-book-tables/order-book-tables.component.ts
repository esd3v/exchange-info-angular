import { Component, OnInit } from '@angular/core';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBookColumn } from '../../types/order-book-column';
import { first } from 'rxjs';
import { Currency } from 'src/app/features/global/types/currency';
import { OrderBookTablesService } from './order-book-tables.service';

@Component({
  selector: 'app-order-book-tables',
  templateUrl: './order-book-tables.component.html',
})
export class OrderBookTablesComponent implements OnInit {
  asksData: Row[] = [];

  bidsData: Row[] = [];

  columns: OrderBookColumn[] = [];

  placeholderRowsCount = WIDGET_DEPTH_DEFAULT_LIMIT;

  get loading() {
    return this.orderBookTablesService.loadingController.loading;
  }

  constructor(
    private orderBookTablesService: OrderBookTablesService,
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
        this.orderBookTablesService.loadData();
      }
    });

    this.orderBookTablesService.onWebsocketOpen();
    this.orderBookTablesService.onRestLoading();
    this.orderBookTablesService.onRestAndDataComplete();

    this.columns = this.#createColumns(this.orderBookTablesService.currency);

    this.orderBookTablesService.asksData$.subscribe((data) => {
      this.asksData = data;
    });

    this.orderBookTablesService.bidsData$.subscribe((data) => {
      this.bidsData = data;
    });
  }
}
