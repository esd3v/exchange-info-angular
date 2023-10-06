import { Component, OnInit } from '@angular/core';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Row } from '../../../../shared/table/types/row';
import { OrderBookTablesService } from '../../services/order-book-tables.service';
import { OrderBookColumn } from '../../types/order-book-column';

@Component({
  selector: 'app-order-book-bids-table',
  templateUrl: './order-book-bids-table.component.html',
})
export class OrderBookBidsTableComponent implements OnInit {
  data: Row[] = [];

  columns: OrderBookColumn[] = [];

  placeholderRowsCount = WIDGET_DEPTH_DEFAULT_LIMIT;

  get loading() {
    return this.orderBookTablesService.loadingController.loading;
  }

  constructor(private orderBookTablesService: OrderBookTablesService) {}

  ngOnInit(): void {
    this.orderBookTablesService.onRestLoading();

    this.orderBookTablesService.globalCurrency$.subscribe((currency) => {
      this.columns = this.orderBookTablesService.createColumns(currency);
    });

    this.orderBookTablesService.bidsData$.subscribe((data) => {
      this.data = data;
    });
  }
}
