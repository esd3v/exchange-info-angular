import {
  AfterViewInit,
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
import { filter, first, skip } from 'rxjs';
import { NgChanges } from 'src/app/shared/types/misc';
import { Row } from 'src/app/shared/types/row';
import { Column } from '../../types/column';
import { TableStyleService } from './table-style.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) private paginator!: MatPaginator;
  @Input() public data: Row[] = [];
  @Input() public columns: Column[] = [];
  @Input() public loading: Boolean = false;
  @Input() public paginatorEnabled: boolean = false;
  @Input() public paginatorPageSizeOptions: number[] = [15];

  @Input() public placeholderRowsCount: number =
    this.paginatorPageSizeOptions[0];

  @Output() public paginatorPageChange: EventEmitter<Row[]> =
    new EventEmitter();

  @Output() public rowClick: EventEmitter<Row> = new EventEmitter();

  @Output() public paginatorPageDataInit: EventEmitter<Row[]> =
    new EventEmitter();

  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();
  public styles = this.tableStyleService;

  public get placeholderRows() {
    return Array<Row>(this.placeholderRowsCount).fill({
      cells: [],
    });
  }

  public get displayedColumns() {
    return this.columns.map((item) => item.id);
  }

  public get columnLabels(): string[] {
    return this.columns.map((item) => item.label);
  }

  private get pageRows$() {
    return this.dataSource.connect();
  }

  public get paginatorLength() {
    return this.data.length;
  }

  public constructor(private tableStyleService: TableStyleService) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  public handleRowClick(row: Row) {
    this.rowClick?.emit(row);
  }

  public handlePageChange(_event: PageEvent) {
    this.pageRows$
      .pipe(
        // Skip immediate value from BehaviorSubject (don't get old rows)
        skip(1),
        first()
      )
      .subscribe((rows) => {
        this.paginatorPageChange?.emit(rows);
      });
  }

  public ngOnInit(): void {
    // Emit page rows on first data render
    this.pageRows$
      .pipe(
        filter((rows) => Boolean(rows.length)),
        first()
      )
      .subscribe((rows) => {
        this.paginatorPageDataInit?.emit(rows);
      });
  }

  public ngAfterViewInit(): void {
    // Create paginator before setting dataSource, for optimization
    // https://stackoverflow.com/a/51296374
    this.dataSource.paginator = this.paginator;
  }

  public ngOnChanges({ data }: NgChanges<TableComponent>): void {
    if (data?.currentValue) {
      // If this table supposed to use paginator
      if (this.paginatorEnabled) {
        // Wait until datasource paginator is set in ngAfterViewInit
        if (this.dataSource.paginator) {
          this.dataSource.data = data.currentValue;
        }
      } else {
        this.dataSource.data = data.currentValue;
      }
    }
  }
}
