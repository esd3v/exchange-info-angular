import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticker-card',
  templateUrl: './ticker-card.component.html',
  styleUrls: ['./ticker-card.component.scss'],
})
export class TickerCardComponent {
  @Input() title!: string;

  @Input() value!: string | number;

  @Input() loading: boolean = false;

  @Input() positive!: boolean;

  constructor() {}
}
