import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';
import { HomerService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public constructor(
    private store$: Store<AppState>,
    private router: Router,
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private homeService: HomerService
  ) {
    this.onRouteEvent();
  }

  public getParsedRoutePair() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair === null) {
      return null;
    }

    const { base, quote } = parsePair(routePair, '_');

    if (!base || !quote) {
      return null;
    }

    return { base, quote };
  }

  public handleNavigationEnd() {
    const parsedRoutePair = this.getParsedRoutePair();

    // If pair is incorrect (e.g ETH_)
    if (!parsedRoutePair) {
      return this.homeService.navigateToDefaultPair();
    }

    const { base, quote } = parsedRoutePair;
    const symbol = `${base}${quote}`;

    this.homeService.initAppData(symbol);

    this.store$.dispatch(
      globalActions.setCurrency({ payload: { base, quote } })
    );
  }

  public onRouteEvent() {
    const routeEvents$ = this.router.events;

    routeEvents$.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        this.handleNavigationEnd();
      }
    });
  }
}
