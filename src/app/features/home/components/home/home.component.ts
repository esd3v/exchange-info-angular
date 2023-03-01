import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { globalActions } from 'src/app/features/global/store';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { HomerService } from '../../services/home.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { MISC_SNACKBAR_DURATION } from 'src/app/shared/config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public constructor(
    private store$: Store<AppState>,
    private router: Router,
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private homeService: HomerService,
    private snackBar: MatSnackBar,
    private websocketService: WebsocketService
  ) {
    this.onRouteEvent();
  }

  public getParsedRoutePair() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair === null) {
      return null;
    }

    const { base, quote } = parsePair(routePair, '_');

    // e.g "ETH_" or "_BTC"
    if (!base || !quote) {
      return null;
    }

    return { base, quote };
  }

  public handleNavigationEnd() {
    const parsedRoutePair = this.getParsedRoutePair();

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

  public openSnackBar(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: MISC_SNACKBAR_DURATION,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  public ngOnInit(): void {
    this.websocketService.status$.subscribe((status) => {
      if (status === 'connecting') {
        this.openSnackBar('Connecting to WebSocket server...');
      } else if (status === 'closed') {
        this.openSnackBar('WebSocket connection closed');
      } else if (status === 'closing') {
        this.openSnackBar('Closing WebSocket connection...');
      } else if (status === 'open') {
        this.openSnackBar('WebSocket connection has been opened');
      }
    });
  }
}
