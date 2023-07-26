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
import { Column } from '../../types/column';
import { TableStyleService } from './table-style.service';
import { Row } from '../../types/row';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) private paginator!: MatPaginator;

  @Input() data: Row[] = [];

  @Input() columns: Column[] = [];

  @Input() loading: Boolean = false;

  @Input() paginatorEnabled: boolean = false;

  @Input() paginatorPageSizeOptions: number[] = [15];

  @Input() placeholderRowsCount: number = this.paginatorPageSizeOptions[0];

  @Output() paginatorPageChange: EventEmitter<Row[]> = new EventEmitter();

  @Output() rowClick: EventEmitter<Row> = new EventEmitter();

  @Output() paginatorPageDataInit: EventEmitter<Row[]> = new EventEmitter();

  dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  styles = this.tableStyleService;

  get placeholderRows() {
    return Array<Row>(this.placeholderRowsCount).fill({
      cells: [],
    });
  }

  get displayedColumns() {
    return this.columns.map((item) => item.id);
  }

  get columnLabels(): string[] {
    return this.columns.map((item) => item.label);
  }

  get #pageRows$() {
    return this.dataSource.connect();
  }

  get paginatorLength() {
    return this.data.length;
  }

  constructor(private tableStyleService: TableStyleService) {}

  trackRow(_index: number, _item: Row) {
    return _index;
  }

  handleRowClick(row: Row) {
    this.rowClick?.emit(row);
  }

  handlePageChange(_event: PageEvent) {
    this.#pageRows$
      .pipe(
        // Skip immediate value from BehaviorSubject (don't get old rows)
        skip(1),
        first()
      )
      .subscribe((rows) => {
        this.paginatorPageChange?.emit(rows);
      });
  }

  ngOnInit(): void {
    // Emit page rows on first data render
    this.#pageRows$
      .pipe(
        filter((rows) => Boolean(rows.length)),
        first()
      )
      .subscribe((rows) => {
        this.paginatorPageDataInit?.emit(rows);
      });
  }

  ngAfterViewInit(): void {
    // Create paginator before setting dataSource, for optimization
    // https://stackoverflow.com/a/51296374
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges({ data }: NgChanges<TableComponent>): void {
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
