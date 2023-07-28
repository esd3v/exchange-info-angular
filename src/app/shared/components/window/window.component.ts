import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowComponent {
  @Input() title: string = '';

  @Input() loading: boolean = false;

  constructor() {}
}
