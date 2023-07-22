import { Injectable } from '@angular/core';
import { LoadingController } from 'src/app/shared/loading-controller';

@Injectable({ providedIn: 'root' })
export class OrderBookTableContainerService {
  public loadingController = new LoadingController(true);
}
