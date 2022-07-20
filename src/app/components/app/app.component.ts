import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatestWith } from 'rxjs';
import { SITE_NAME } from 'src/app/config';
import { formatLastPrice } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private titleService: Title, private store: Store<AppState>) {}

  ngOnInit(): void {
    const globalPair$ = this.store.select(selectors.global.globalPair);
    const lastPrice$ = this.store.select(selectors.ticker.lastPrice);

    globalPair$
      .pipe(combineLatestWith(lastPrice$))
      .subscribe(([globalPair, _lastPrice]) => {
        this.store.select(selectors.ticker.lastPrice).subscribe((data) => {
          const lastPrice = data;

          const title = lastPrice
            ? globalPair
              ? `${formatLastPrice(lastPrice)} | ${globalPair} | ${SITE_NAME}`
              : `${formatLastPrice(lastPrice)} | ${SITE_NAME}`
            : globalPair
            ? `${globalPair} | ${SITE_NAME}`
            : `${SITE_NAME}`;

          this.titleService.setTitle(title);
        });
      });
  }
}
