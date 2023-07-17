import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgChanges } from 'src/app/shared/types/misc';
import { Row } from 'src/app/shared/types/row';
import { PairsTableStyleService } from '../../services/pairs-table-style.service';
import { PairColumn } from '../../types/pair-column';
import { filter, first, skip } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';

@Component({
  selector: 'app-pairs-table',
  templateUrl: './pairs-table.component.html',
  styleUrls: ['./pairs-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator, { static: true }) private paginator!: MatPaginator;
  @Input() public loading: Boolean = false;
  @Input() public data: Row[] = [];
  @Input() public pageSizeOptions: number[] = [15];
  @Output() public rowClick: EventEmitter<Row> = new EventEmitter();
  @Output() public pageChange: EventEmitter<Row[]> = new EventEmitter();
  @Output() public pageDataInit: EventEmitter<Row[]> = new EventEmitter();

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();
  public styles = this.pairsTableStyleService;
  public placeholderRows = Array<Row>(this.pageSizeOptions[0]).fill([]);
  public displayedColumns = this.columns.map((item) => item.id);
  public globalPair$ = this.globalFacade.pair$;

  public get length() {
    return this.data.length;
  }

  private get pageRows$() {
    return this.dataSource.connect();
  }

  public constructor(
    private pairsTableStyleService: PairsTableStyleService,
    private globalFacade: GlobalFacade
  ) {}

  public trackRow(_index: number, _row: Row) {
    return _index;
  }

  public handleRowClick(row: Row) {
    this.rowClick.emit(row);
  }

  public handlePageChange(_event: PageEvent) {
    this.pageRows$
      .pipe(
        // Skip immediate value from BehaviorSubject (don't get old rows)
        skip(1),
        first()
      )
      .subscribe((rows) => {
        this.pageChange.emit(rows);
      });
  }

  public ngOnInit(): void {
    // Create paginator before setting dataSource, for optimization
    this.dataSource.paginator = this.paginator;

    // Emit page rows on first data render
    this.pageRows$
      .pipe(
        filter((rows) => Boolean(rows.length)),
        first()
      )
      .subscribe((rows) => {
        this.pageDataInit.emit(rows);
      });
  }

  public ngOnChanges({ data }: NgChanges<PairsTableComponent>): void {
    if (data?.currentValue) {
      this.dataSource.data = data.currentValue;
    }
  }
}
