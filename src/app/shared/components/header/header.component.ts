import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_SITE_NAME } from 'src/app/shared/config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  siteName = APP_SITE_NAME;

  constructor() {}
}
