import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_HTTP_BASEURL } from '../../shared/config';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const cloned = req.clone({
      url: `${API_HTTP_BASEURL}/${req.url}`,
    });

    return next.handle(cloned);
  }
}
