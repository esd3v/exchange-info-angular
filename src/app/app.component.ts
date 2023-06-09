import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from './app.service';
import { HomerService } from './features/home/services/home.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public constructor(
    private appService: AppService,
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private homeService: HomerService,
    private router: Router
  ) {}

  private onRouteEvent() {
    this.router.events.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        // If we opened root (/) without pair param
        if (!this.route.children.length) {
          this.homeService.navigateToDefaultPair();
        }
      }
    });
  }

  public ngOnInit(): void {
    this.onRouteEvent();

    this.appService.setTitle();
    this.appService.onWebsocketOpen();
    this.appService.onWebsocketMessage();
    this.appService.startWebSocket();
  }
}
