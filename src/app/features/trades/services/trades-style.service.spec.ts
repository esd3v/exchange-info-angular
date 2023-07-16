import { TestBed } from '@angular/core/testing';

import { TradesStyleService } from './trades-style.service';

describe('TradesStyleService', () => {
  let service: TradesStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradesStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
