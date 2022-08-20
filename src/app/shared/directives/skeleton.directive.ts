import { Directive, HostBinding, Input, OnInit } from '@angular/core';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

@Directive({
  selector: '[appSkeleton]',
})
export class SkeletonDirective implements OnInit {
  @Input() public width: string | number = '100%';

  @HostBinding('style.font-size')
  private fontSize = 0;

  @HostBinding('style.display')
  private display = 'block';

  public constructor(private skeleton: NgxSkeletonLoaderComponent) {}

  public ngOnInit() {
    this.skeleton.count = 1;
    this.skeleton.appearance = 'line';
    this.skeleton.animation = false;

    this.skeleton.theme = {
      display: 'inline-block',
      height: '1em',
      width: this.width,
      'margin-bottom.px': 0,
      'font-size.px': 16,
      'vertical-align': 'middle',
    };
  }
}
