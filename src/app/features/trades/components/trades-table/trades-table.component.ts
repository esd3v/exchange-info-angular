import { Component, OnInit } from '@angular/core';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TradesColumn } from '../../types/trades-column';
import { TradesTableService } from './trades-table.service';
import { first } from 'rxjs';
import { Currency } from 'src/app/features/global/types/currency';

@Component({
  selector: 'app-trades-table',
  templateUrl: './trades-table.component.html',
})
export class TradesTableComponent implements OnInit {
  constructor(
    private tradesTableService: TradesTableService,
    private websocketService: WebsocketService
  ) {}

  data: Row[] = [];

  columns: TradesColumn[] = [];

  placeholderRowsCount = WIDGET_TRADES_DEFAULT_LIMIT;

  get loading() {
    return this.tradesTableService.loadingController.loading;
  }

  #createColumns({ base, quote }: Currency): TradesColumn[] {
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
      {
        id: 'time',
        numeric: true,
        label: 'Time',
      },
    ];
  }

  ngOnInit(): void {
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === null) {
        // Load REST data only if we start the app with websockets disabled
        this.tradesTableService.loadData();
      }
    });

    this.tradesTableService.onWebsocketOpen();
    this.tradesTableService.onRestLoading();
    this.tradesTableService.onRestAndDataComplete();

    this.tradesTableService.data$.subscribe((data) => {
      this.data = data;
    });

    this.columns = this.#createColumns(this.tradesTableService.currency);
  }
}
