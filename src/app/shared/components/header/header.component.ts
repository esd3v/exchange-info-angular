import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_SITE_NAME } from 'src/app/shared/config';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  breakpoint$ = this.layoutService.breakpoint$;

  siteName = APP_SITE_NAME;

  constructor(private layoutService: LayoutService) {}
}
