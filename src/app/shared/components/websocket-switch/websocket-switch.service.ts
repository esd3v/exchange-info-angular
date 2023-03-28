import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WEBSOCKET_ENABLED_AT_START } from '../../config';

@Injectable({
  providedIn: 'root',
})
export class WebsocketSwitchService {
  public checked$ = new BehaviorSubject(WEBSOCKET_ENABLED_AT_START);
}
