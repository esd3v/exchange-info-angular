import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { WebsocketSwitchComponent } from './websocket-switch.component';

@NgModule({
  declarations: [WebsocketSwitchComponent],
  imports: [CommonModule, MatSlideToggleModule],
  exports: [WebsocketSwitchComponent],
})
export class WebsocketSwitchModule {}
