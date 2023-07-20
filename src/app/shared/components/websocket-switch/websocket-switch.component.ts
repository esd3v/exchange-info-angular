import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, map } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WEBSOCKET_ENABLED_AT_START } from '../../config';

@Component({
  selector: 'app-websocket-switch',
  templateUrl: './websocket-switch.component.html',
  styleUrls: ['./websocket-switch.component.scss'],
})
export class WebsocketSwitchComponent {
  public checked$ = new BehaviorSubject(WEBSOCKET_ENABLED_AT_START);

  public disabled$ = this.websocketService.status$.pipe(
    map((status) =>
      status === 'closing' || status === 'connecting' || status === null
        ? true
        : false
    )
  );

  public constructor(private websocketService: WebsocketService) {}

  public handleChange({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.checked$.next(true);

      if (
        this.websocketService.status === 'closed' ||
        this.websocketService.status === null
      ) {
        this.websocketService.connect('switch');
      }
    } else {
      this.checked$.next(false);
      this.websocketService.close('switch');
    }
  }
}
