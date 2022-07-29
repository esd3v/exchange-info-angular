import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticker-card',
  templateUrl: './ticker-card.component.html',
  styleUrls: ['./ticker-card.component.scss'],
})
export class TickerCardComponent {
  constructor() {}

  @Input() title: string | null = null;
  @Input() value: string | number | null = null;
  @Input() loading: boolean | null = false;
  @Input() positive: boolean | null = null;
}