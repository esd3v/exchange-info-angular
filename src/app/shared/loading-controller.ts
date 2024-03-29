import { BehaviorSubject } from 'rxjs';

export class LoadingController {
  private _loading!: boolean;

  private _loading$ = new BehaviorSubject(this._loading);

  get loading() {
    return this._loading;
  }

  get loading$() {
    return this._loading$;
  }

  constructor(loading: boolean = true) {
    this._loading = loading;
    this._loading$.next(loading);
  }

  setLoading(value: boolean) {
    this._loading$.next(value);
    this._loading = value;
  }
}
