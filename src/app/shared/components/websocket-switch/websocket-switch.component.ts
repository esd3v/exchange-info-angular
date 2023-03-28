import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { map } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketSwitchService } from './websocket-switch.service';

@Component({
  selector: 'app-websocket-switch',
  templateUrl: './websocket-switch.component.html',
  styleUrls: ['./websocket-switch.component.scss'],
})
export class WebsocketSwitchComponent {
  public disabled$ = this.websocketService.status$.pipe(
    map((status) =>
      status === 'closing' || status === 'connecting' || status === null
        ? true
        : false
    )
  );

  public constructor(
    private websocketService: WebsocketService,
    public websocketSwitchService: WebsocketSwitchService
  ) {}

  public handleChange({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.websocketSwitchService.checked$.next(true);

      this.websocketService.closedOrNullCurrent$.subscribe(() => {
        this.websocketService.connect('switch');
      });
    } else {
      this.websocketSwitchService.checked$.next(false);

      this.websocketService.openCurrent$.subscribe(() => {
        this.websocketService.close();
      });
    }
  }
}
