import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private store: Store<AppState>, private route: ActivatedRoute) {}

  ngOnInit() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair !== null) {
      const { base, quote } = parsePair(routePair, '_');

      if (base && quote) {
        this.store.dispatch(
          globalActions.setCurrency({ payload: { base, quote } })
        );
      }
    }
  }
}
