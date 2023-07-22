import { Observable, Subject, takeUntil } from 'rxjs';
import { LoadingStatus } from 'src/app/store/state';

export abstract class WithRest {
  abstract get(params: any): any;
  abstract loadData(params: any): any;

  handleDataLoad<T extends Observable<LoadingStatus>>(status$: T) {
    return ({
      onSuccess,
      onError,
    }: {
      onSuccess?: () => void;
      onError?: () => void;
    }) => {
      const stop$ = new Subject<void>();

      if (onSuccess || onError) {
        status$.pipe(takeUntil(stop$)).subscribe((status) => {
          if (onSuccess && status === 'success') {
            onSuccess();
            stop$.next();
          } else if (onError && status === 'error') {
            onError();
            stop$.next();
          }
        });
      }
    };
  }
}
