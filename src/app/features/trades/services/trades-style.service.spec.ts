import { TestBed } from '@angular/core/testing';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';

describe('TradesStyleService', () => {
  let service: TableStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
