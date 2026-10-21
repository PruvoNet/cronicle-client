'use strict';

import {afterEach, beforeEach, describe, expect, it, Mock, vi} from 'vitest';
import {RequestError, requestJson, StatusCodeError} from '../../src/http';

describe('http', () => {

    let fetchStub: Mock;

    beforeEach(() => {
        fetchStub = vi.fn();
        vi.stubGlobal('fetch', fetchStub);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const respond = (status: number, body?: object | string) => fetchStub.mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        text: () => Promise.resolve(body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)),
    });

    it('should send a JSON body and parse the JSON response', () => {
        respond(200, {code: 0, id: 'x'});
        return requestJson({url: 'http://h/a', method: 'POST', body: {id: 'x'}, headers: {'X-API-Key': 'k'}, json: true})
            .then((resp) => {
                expect(resp).to.eql({code: 0, id: 'x'});
                expect(fetchStub.mock.calls[0][0]).to.eq('http://h/a');
                expect(fetchStub.mock.calls[0][1]).to.eql({
                    method: 'POST',
                    headers: {'X-API-Key': 'k', 'Accept': 'application/json', 'Content-Type': 'application/json'},
                    body: '{"id":"x"}',
                });
            });
    });

    it('should send a GET without a body', () => {
        respond(200, {code: 0});
        return requestJson({url: 'http://h/b?x=1', method: 'GET', headers: {'X-API-Key': 'k'}, json: true})
            .then(() => {
                expect(fetchStub.mock.calls[0][1]).to.eql({
                    method: 'GET',
                    headers: {'X-API-Key': 'k', 'Accept': 'application/json'},
                });
            });
    });

    it('should resolve undefined for an empty body', () => {
        respond(200);
        return requestJson({url: 'http://h/c', method: 'GET', headers: {}, json: true})
            .then((resp) => expect(resp).to.eq(undefined));
    });

    it('should reject with StatusCodeError on a non-2xx status', () => {
        respond(503, {message: 'down'});
        return requestJson({url: 'http://h/d', method: 'GET', headers: {}, json: true})
            .then(() => expect.unreachable('should reject'), (err) => {
                expect(err).to.be.instanceOf(StatusCodeError);
                expect(err.name).to.eq('StatusCodeError');
                expect(err.statusCode).to.eq(503);
                expect(err.error).to.eql({message: 'down'});
                expect(err.message).to.eq('503 - {"message":"down"}');
            });
    });

    it('should reject with StatusCodeError and the raw text when an error body is not JSON', () => {
        respond(502, '<html>Bad Gateway</html>');
        return requestJson({url: 'http://h/e', method: 'GET', headers: {}, json: true})
            .then(() => expect.unreachable('should reject'), (err) => {
                expect(err).to.be.instanceOf(StatusCodeError);
                expect(err.statusCode).to.eq(502);
                expect(err.error).to.eq('<html>Bad Gateway</html>');
            });
    });

    const fetchFailed = (cause: unknown) => Object.assign(new TypeError('fetch failed'), {cause});

    it('should reject with RequestError carrying the socket error when no response arrives', () => {
        const cause = Object.assign(new Error('connect ECONNREFUSED 10.0.0.1:3012'), {code: 'ECONNREFUSED'});
        fetchStub.mockRejectedValue(fetchFailed(cause));
        return requestJson({url: 'http://h/g', method: 'GET', headers: {}, json: true})
            .then(() => expect.unreachable('should reject'), (err) => {
                expect(err).to.be.instanceOf(RequestError);
                expect(err.name).to.eq('RequestError');
                expect(err.message).to.eq('connect ECONNREFUSED 10.0.0.1:3012');
                expect(err.code).to.eq('ECONNREFUSED');
                expect(err.cause).to.eq(cause);
                expect(err.error).to.eq(cause);
                expect(err.statusCode).to.eq(undefined);
            });
    });

    it('should describe an AggregateError cause by its inner errors', () => {
        const cause = Object.assign(new Error(''), {
            code: 'ECONNREFUSED',
            errors: [new Error('connect ECONNREFUSED ::1:3012'), new Error('connect ECONNREFUSED 127.0.0.1:3012')],
        });
        fetchStub.mockRejectedValue(fetchFailed(cause));
        return requestJson({url: 'http://h/h', method: 'GET', headers: {}, json: true})
            .then(() => expect.unreachable('should reject'), (err) => {
                expect(err).to.be.instanceOf(RequestError);
                expect(err.message).to.eq('connect ECONNREFUSED ::1:3012; connect ECONNREFUSED 127.0.0.1:3012');
                expect(err.code).to.eq('ECONNREFUSED');
            });
    });

    it('should add the code to the message when the message lacks it', () => {
        const cause = Object.assign(new Error('getaddrinfo failed'), {code: 'ENOTFOUND'});
        fetchStub.mockRejectedValue(fetchFailed(cause));
        return requestJson({url: 'http://h/i', method: 'GET', headers: {}, json: true})
            .then(() => expect.unreachable('should reject'), (err) => {
                expect(err.message).to.eq('ENOTFOUND getaddrinfo failed');
            });
    });

    it('should resolve with the raw text when a 2xx body is not JSON', () => {
        respond(200, 'OK');
        return requestJson({url: 'http://h/f', method: 'GET', headers: {}, json: true})
            .then((resp) => expect(resp).to.eq('OK'));
    });

});
