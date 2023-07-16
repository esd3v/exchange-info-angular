import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticker-card',
  templateUrl: './ticker-card.component.html',
  styleUrls: ['./ticker-card.component.scss'],
})
export class TickerCardComponent {
  @Input() public title!: string;
  @Input() public value!: string | number;
  @Input() public loading: boolean = false;
  @Input() public positive!: boolean;

  public constructor() {}
}
