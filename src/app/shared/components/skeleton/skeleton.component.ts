import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { SkeletonProps } from './skeleton-props';

@Component({
  selector: 'app-skeleton',
  templateUrl: 'skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent implements OnInit {
  @ViewChild('ngxSkeleton', { read: ViewContainerRef })
  ngxSkeleton: ComponentRef<NgxSkeletonLoaderComponent> =
    this.viewContainerRef.createComponent(NgxSkeletonLoaderComponent);

  @Input() width: SkeletonProps['width'] = '100%';

  @HostBinding('style.font-size')
  private fontSize = 0;

  @HostBinding('style.display')
  private display = 'block';

  constructor(private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.ngxSkeleton.instance.appearance = 'line';
    this.ngxSkeleton.instance.animation = false;

    this.ngxSkeleton.instance.theme = {
      display: 'inline-block',
      height: '0.75em',
      width: this.width,
      'margin-bottom.px': 0,
      'vertical-align': 'middle',
    };
  }
}
