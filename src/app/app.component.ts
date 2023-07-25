import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from './features/home/components/home/home.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private homeService: HomeService,
    private router: Router
  ) {}

  #onRouteEvent() {
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

  ngOnInit(): void {
    this.#onRouteEvent();
  }
}
