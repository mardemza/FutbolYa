import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const traceId = request.headers['x-request-id']?.toString() ?? crypto.randomUUID();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const message =
        typeof payload === 'string'
          ? payload
          : (payload as { message?: string | string[] }).message ?? exception.message;

      response.status(status).json({
        code: this.statusCodeToErrorCode(status),
        message,
        details: typeof payload === 'string' ? null : payload,
        traceId,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
      details: null,
      traceId,
    });
  }

  private statusCodeToErrorCode(statusCode: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'BUSINESS_RULE_VIOLATION',
    };

    return map[statusCode] ?? 'HTTP_ERROR';
  }
}
