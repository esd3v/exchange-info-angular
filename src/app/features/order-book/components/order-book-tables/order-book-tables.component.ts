import { Component, OnInit } from '@angular/core';
import { Currency } from 'src/app/features/global/types/currency';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Row } from '../../../../shared/table/types/row';
import { OrderBookColumn } from '../../types/order-book-column';
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

  constructor(private orderBookTablesService: OrderBookTablesService) {}

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
    this.orderBookTablesService.onRestLoading();

    this.orderBookTablesService.globalCurrency$.subscribe((currency) => {
      this.columns = this.#createColumns(currency);
    });

    this.orderBookTablesService.asksData$.subscribe((data) => {
      this.asksData = data;
    });

    this.orderBookTablesService.bidsData$.subscribe((data) => {
      this.bidsData = data;
    });
  }
}
