import { NgModule } from '@angular/core';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { PairsTableModule } from '../pairs-table/pairs-table.module';
import { PairsTableContainerComponent } from './pairs-table-container.component';

@NgModule({
  declarations: [PairsTableContainerComponent],
  imports: [PairsTableModule, WindowModule],
  exports: [PairsTableContainerComponent],
})
export class PairsTableContainerModule {}
