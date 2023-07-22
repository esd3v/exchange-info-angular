import { Injectable } from '@angular/core';
import { LoadingController } from 'src/app/shared/loading-controller';

@Injectable({ providedIn: 'root' })
export class OrderBookTableContainerService extends LoadingController {
  public constructor() {
    super(true);
  }
}
