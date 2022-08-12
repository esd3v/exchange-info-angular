import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
})
export class WindowComponent {
  @Input() public title: string = '';
  @Input() public loading: boolean = false;

  public constructor() {}
}
