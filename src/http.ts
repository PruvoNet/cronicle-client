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

/** Sends a JSON request with the global fetch (Node 18+) and resolves with the parsed JSON body. */
export const requestJson = async (req: IJsonRequest): Promise<any> => {
    const headers: { [name: string]: string } = {...req.headers, Accept: 'application/json'};
    const init: RequestInit = {method: req.method, headers};
    if (req.body !== undefined) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(req.body);
    }
    const response = await fetch(req.url, init);
    const text = await response.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!response.ok) {
        throw new StatusCodeError(response.status, body);
    }
    return body;
};
