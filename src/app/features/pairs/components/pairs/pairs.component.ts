import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickerSelectors } from 'src/app/features/ticker/store';
import { exchangeInfoSelectors } from 'src/app/features/exchangeInfo/store';
import { PairColumn } from '../../models/pair-column.model';
import { PairRow } from '../../models/pair-row.model';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  styleUrls: ['./pairs.component.scss'],
})
export class PairsComponent implements OnInit {
  dataSource!: MatTableDataSource<PairRow>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store<AppState>) {}

  page: number = 0;
  tickers$ = this.store.select(tickerSelectors.data).pipe(filter(Boolean));

  symbols$ = this.store
    .select(exchangeInfoSelectors.tradingSymbols)
    .pipe(filter(Boolean));

  columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  displayedColumns: string[] = this.columns.map((item) => item.id);

  getCellValue(row: PairRow, columnId: PairColumn['id']) {
    return columnId === 'pair'
      ? `${row.baseAsset}/${row.quoteAsset}`
      : row[columnId];
  }

  ngOnInit(): void {
    combineLatest([this.symbols$, this.tickers$])
      .pipe(
        map(([symbols, tickers]) => {
          const rows: PairRow[] = [];

          for (const { baseAsset, quoteAsset } of symbols) {
            for (const { symbol, lastPrice, priceChangePercent } of tickers) {
              if (symbol === `${baseAsset}${quoteAsset}`) {
                rows.push({
                  baseAsset,
                  quoteAsset,
                  lastPrice,
                  priceChangePercent,
                });

                break;
              }
            }
          }

          return rows;
        })
      )
      .subscribe((data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
      });
  }
}
