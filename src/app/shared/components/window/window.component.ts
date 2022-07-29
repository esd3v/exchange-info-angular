import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
})
export class WindowComponent implements OnInit {
  constructor() {}

  @Input() title: string = '';
  @Input() loading: boolean = false;

  ngOnInit(): void {}
}
