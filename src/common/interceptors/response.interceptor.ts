import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as keyof typeof defaultMessages;

    const defaultMessages = {
      GET: 'Data fetched successfully',
      POST: 'Data created successfully',
      PATCH: 'Data updated successfully',
      PUT: 'Data replaced successfully',
      DELETE: 'Data deleted successfully',
    };

    const fallbackMessage = 'Request successful';
    const message = defaultMessages[method] || fallbackMessage;

    return next.handle().pipe(
      map((data) => ({
        status: true,
        message: data?.message || message,
        data,
      })),
    );
  }
}
