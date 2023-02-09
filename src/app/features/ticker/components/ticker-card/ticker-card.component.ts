import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticker-card',
  templateUrl: './ticker-card.component.html',
  styleUrls: ['./ticker-card.component.scss'],
})
export class TickerCardComponent {
  @Input() public title: string | null = null;
  @Input() public value: string | number | null = null;
  @Input() public loading: boolean | null = false;
  @Input() public positive: boolean | null = null;

  public constructor() {}
}
