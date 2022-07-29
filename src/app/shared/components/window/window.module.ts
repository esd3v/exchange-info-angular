import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { WindowComponent } from './window.component';

@NgModule({
  declarations: [WindowComponent],
  imports: [CommonModule, MatCardModule],
  exports: [WindowComponent],
})
export class WindowModule {}
