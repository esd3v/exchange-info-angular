import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { map } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';

@Component({
  selector: 'app-websocket-switch',
  templateUrl: './websocket-switch.component.html',
  styleUrls: ['./websocket-switch.component.scss'],
})
export class WebsocketSwitchComponent {
  public disabled$ = this.websocketService.status$.pipe(
    map((status) =>
      status === 'closing' || status === 'connecting' ? true : false
    )
  );

  public constructor(private websocketService: WebsocketService) {}

  public handleChange({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.websocketService.connect();
    } else {
      this.websocketService.close();
    }
  }
}
