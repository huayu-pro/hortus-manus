import type { Context } from 'hono'
import type { ApiErrorBody } from '@hortus/shared'

export type ErrorCode =
  | 'validation_error'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'payload_too_large'
  | 'bad_request'
  | 'internal_error'
  | 'method_not_allowed'

const STATUS: Record<ErrorCode, number> = {
  validation_error: 422,
  not_found: 404,
  unauthorized: 401,
  forbidden: 403,
  rate_limited: 429,
  payload_too_large: 413,
  bad_request: 400,
  internal_error: 500,
  method_not_allowed: 405,
}

export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown
  readonly headers?: Record<string, string>

  constructor(code: ErrorCode, message: string, opts?: { details?: unknown; headers?: Record<string, string>; status?: number }) {
    super(message)
    this.code = code
    this.status = opts?.status ?? STATUS[code]
    this.details = opts?.details
    this.headers = opts?.headers
  }
}

export function errorBody(error: string, message: string, details?: unknown): ApiErrorBody & { details?: unknown } {
  return details === undefined ? { error, message } : { error, message, details }
}

/** JSON error response with the unified {error,message} shape and no-store. */
export function jsonError(c: Context, err: ApiError): Response {
  const body = errorBody(err.code, err.message, err.details)
  if (err.headers) for (const [k, v] of Object.entries(err.headers)) c.header(k, v)
  c.header('Cache-Control', 'no-store')
  return c.json(body, err.status as 400)
}

export function notFound(message = '这株标本还没有被压进纸里。 / This specimen has not been pressed yet.'): ApiError {
  return new ApiError('not_found', message)
}
