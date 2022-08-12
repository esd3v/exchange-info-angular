import { Component } from '@angular/core';
import { SITE_NAME } from 'src/app/shared/config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public siteName = SITE_NAME;

  public constructor() {}
}
