import { routes } from './routes';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeModule } from '../features/home/components/home/home.module';

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), HomeModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
