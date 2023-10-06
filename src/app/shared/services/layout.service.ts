import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  breakpoint$: BehaviorSubject<keyof typeof Breakpoints | null> =
    new BehaviorSubject(null as keyof typeof Breakpoints | null);

  constructor(private breakpointObserver: BreakpointObserver) {
    this.handleBreakpoints();
  }

  handleBreakpoints() {
    const remapped: Record<string, keyof typeof Breakpoints> = {};

    for (const key in Breakpoints) {
      remapped[Breakpoints[key as keyof typeof Breakpoints]] =
        key as keyof typeof Breakpoints;
    }

    this.breakpointObserver
      .observe([
        Breakpoints.XLarge,
        Breakpoints.Large,
        Breakpoints.Medium,
        Breakpoints.Small,
        Breakpoints.XSmall,
      ])
      .subscribe(({ breakpoints }) => {
        for (const item of Object.keys(breakpoints)) {
          const matched = breakpoints[item];

          if (matched) {
            this.breakpoint$.next(remapped[item]);
          }
        }
      });
  }
}
