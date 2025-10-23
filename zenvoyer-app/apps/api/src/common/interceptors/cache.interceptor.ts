import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if cached
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Cache the response
    return next.handle().pipe(
      tap((response) => {
        this.cache.set(cacheKey, response);
        // Clear cache after 5 minutes
        setTimeout(() => this.cache.delete(cacheKey), 300000);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    return `${request.url}-${JSON.stringify(request.query)}`;
  }

  clearCache() {
    this.cache.clear();
  }
}
