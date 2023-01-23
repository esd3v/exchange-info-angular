import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { map, take } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WEBSOCKET_ENABLED_AT_START } from '../../config';

@Component({
  selector: 'app-websocket-switch',
  templateUrl: './websocket-switch.component.html',
  styleUrls: ['./websocket-switch.component.scss'],
})
export class WebsocketSwitchComponent {
  public checked = WEBSOCKET_ENABLED_AT_START;
  private wsStatus$ = this.websocketService.status$;

  public disabled$ = this.wsStatus$.pipe(
    map((status) =>
      status === 'closing' || status === 'connecting' ? true : false
    )
  );

  public constructor(private websocketService: WebsocketService) {}

  public handleChange({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.wsStatus$.pipe(take(1)).subscribe((status) => {
        if (status === 'closed' || status === null) {
          this.websocketService.connect('switch');
        }
      });
    } else {
      this.wsStatus$.pipe(take(1)).subscribe((status) => {
        if (status === 'open') {
          this.websocketService.close();
        }
      });
    }
  }
}
