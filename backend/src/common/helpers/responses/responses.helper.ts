// src/common/http/responses.helper.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';

type OkOptions = {
  noStore?: boolean; // sets Cache-Control: no-store
  etag?: string; // optionally attach an ETag
  statusCode?: number; // override (e.g., 200 default, useful for 206 etc.)
};

export function setNoStore(res?: Response) {
  if (res) res.setHeader('Cache-Control', 'no-store');
}
export function setETag(res: Response | undefined, etag: string | undefined) {
  if (res && etag) res.setHeader('ETag', etag);
}

/** -------------------- HTTP 2xx -------------------- */
export function ok<T>(
  res: Response | undefined,
  data: T,
  opts: OkOptions = {},
) {
  if (opts.noStore) setNoStore(res);
  setETag(res, opts.etag);
  if (res && opts.statusCode) res.status(opts.statusCode);
  return data;
}

export function created<T>(
  res: Response,
  data: T,
  location?: string,
  opts: { noStore?: boolean } = {},
) {
  if (location) res.setHeader('Location', location);
  if (opts.noStore) setNoStore(res);
  res.status(201);
  return data;
}

export function accepted<T>(
  res: Response,
  data: T,
  opts: { noStore?: boolean } = {},
) {
  if (opts.noStore) setNoStore(res);
  res.status(202);
  return data;
}

export function noContent(res: Response) {
  res.status(204).send();
  return undefined as unknown as void;
}

/** -------------------- HTTP 3xx -------------------- */
export function seeOther(res: Response, location: string) {
  res.setHeader('Location', location);
  res.status(303).send();
  return undefined as unknown as void;
}
export function temporaryRedirect(res: Response, location: string) {
  res.setHeader('Location', location);
  res.status(307).send();
  return undefined as unknown as void;
}
export function permanentRedirect(res: Response, location: string) {
  res.setHeader('Location', location);
  res.status(308).send();
  return undefined as unknown as void;
}
export function notModified(res: Response) {
  res.status(304).send();
  return undefined as unknown as void;
}

/** ---------------- Auth/security-aware 4xx ---------------- */
export function unauthorized(
  res: Response | undefined,
  message = 'Authentication required',
  opts: { scheme?: string; error?: string } = {},
): never {
  const scheme = opts.scheme ?? 'Bearer';
  const header = opts.error ? `${scheme} error="${opts.error}"` : scheme;
  if (res) res.setHeader('WWW-Authenticate', header);
  throw new UnauthorizedException(message);
}

export function opaqueNotFound(message = 'Not found'): never {
  throw new NotFoundException(message);
}
export function badRequest(message = 'Bad request : missing deviceId'): never {
  throw new BadRequestException(message);
}
export function forbidden(message = 'Not allowed'): never {
  throw new ForbiddenException(message);
}
export function conflict(message = 'Conflict'): never {
  throw new ConflictException(message);
}
export function validationFailed(details?: Record<string, unknown>): never {
  throw new UnprocessableEntityException({
    status: 'error',
    code: 422,
    message: 'Validation failed',
    details,
  });
}

/** -------------------- HTTP 5xx -------------------- */
export function serviceUnavailable(
  res: Response | undefined,
  message = 'Temporarily unavailable',
  retryAfterSeconds?: number,
): never {
  if (res && retryAfterSeconds) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
  }
  throw new ServiceUnavailableException(message);
}
export function internalError(message = 'Internal server error'): never {
  throw new InternalServerErrorException(message);
}
