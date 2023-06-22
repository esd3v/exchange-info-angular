import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CandlesRestService } from './candles-rest.service';
import { CandlesGetParams } from '../types/candles-get-params';
import { Candle } from '../types/candle';

describe('CandlesRestService', () => {
  let service: CandlesRestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandlesRestService],
    });

    service = TestBed.inject(CandlesRestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request', () => {
    const { symbol, interval }: CandlesGetParams = {
      symbol: 'BTCUSDT',
      interval: '1h',
    };

    const mockResponse: Candle[] = [];

    service.get$({ symbol, interval }).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `klines?symbol=${symbol}&interval=${interval}`
    );

    expect(req.request.method).toBe('GET');
  });
});
