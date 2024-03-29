import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WebsocketSwitchModule } from '../../../websocket/components/websocket-switch/websocket-switch.module';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, MatToolbarModule, WebsocketSwitchModule],
  exports: [HeaderComponent],
})
export class HeaderModule {}
