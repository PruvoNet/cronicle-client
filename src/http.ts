'use strict';

export interface IJsonRequest {
    url: string;
    method: string;
    body?: object;
    headers: { [name: string]: string };
    json: true;
}

/**
 * Thrown for a non-2xx response. Same shape as request-promise's StatusCodeError
 * (`statusCode`, `error` = response body), so callers that caught it keep working.
 */
export class StatusCodeError extends Error {
    public readonly name = 'StatusCodeError';

    constructor(public readonly statusCode: number, public readonly error: unknown) {
        super(`${statusCode} - ${JSON.stringify(error)}`);
        Object.setPrototypeOf(this, StatusCodeError.prototype);
    }
}

/**
 * Thrown when no response arrives (connection refused, DNS failure, reset). Same shape as
 * request-promise's RequestError (`cause`, `error`), plus the system `code` (e.g. ECONNREFUSED).
 * fetch only says "fetch failed", so the message comes from the underlying cause.
 */
export class RequestError extends Error {
    public readonly name = 'RequestError';
    public readonly code?: string;
    public readonly error: unknown;

    constructor(public readonly cause: unknown) {
        super(describeCause(cause));
        this.error = cause;
        this.code = causeCode(cause);
        Object.setPrototypeOf(this, RequestError.prototype);
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const causeCode = (cause: unknown): string | undefined =>
    isRecord(cause) && typeof cause.code === 'string' ? cause.code : undefined;

// With happy-eyeballs the cause can be an AggregateError with an empty message; use its inner errors then.
const describeCause = (cause: unknown): string => {
    let message = cause instanceof Error ? cause.message : String(cause);
    if (!message && isRecord(cause) && Array.isArray(cause.errors)) {
        message = cause.errors.map((e) => (e instanceof Error ? e.message : String(e))).join('; ');
    }
    const code = causeCode(cause);
    if (code && !message.includes(code)) {
        return message ? `${code} ${message}` : code;
    }
    return message || 'request failed';
};

// A body that is not JSON (e.g. a proxy's HTML error page) stays raw text, as with request-promise.
const parseBody = (text: string): unknown => {
    if (!text) {
        return undefined;
    }
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

/** Sends a JSON request with the global fetch (Node 18+) and resolves with the parsed JSON body. */
export const requestJson = async (req: IJsonRequest): Promise<any> => {
    const headers: { [name: string]: string } = {...req.headers, Accept: 'application/json'};
    const init: RequestInit = {method: req.method, headers};
    if (req.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(req.body);
    }
    let response: Response;
    let text: string;
    try {
        response = await fetch(req.url, init);
        text = await response.text();
    } catch (err) {
        throw new RequestError(isRecord(err) && err.cause !== undefined ? err.cause : err);
    }
    const body = parseBody(text);
    if (!response.ok) {
        throw new StatusCodeError(response.status, body);
    }
    return body;
};
