import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { parsePair } from 'src/app/helpers';
import { actions, AppState } from 'src/app/store';

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
      console.log(base, quote);

      if (base && quote) {
        this.store.dispatch(
          actions.global.setCurrency({ payload: { base, quote } })
        );
      }
    }
  }
}
