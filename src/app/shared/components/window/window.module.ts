import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WindowComponent } from './window.component';

@NgModule({
  declarations: [WindowComponent],
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  exports: [WindowComponent],
})
export class WindowModule {}
