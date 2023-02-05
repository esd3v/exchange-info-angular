import { Component } from '@angular/core';
import { APP_SITE_NAME } from 'src/app/shared/config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public siteName = APP_SITE_NAME;

  public constructor() {}
}
