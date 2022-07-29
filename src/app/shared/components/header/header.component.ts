import { Component } from '@angular/core';
import { SITE_NAME } from 'src/app/shared/config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor() {}

  siteName = SITE_NAME;
}
