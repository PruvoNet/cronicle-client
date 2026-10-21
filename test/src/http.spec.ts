'use strict';

import {expect} from 'chai';
// @ts-ignore
import * as sinon from 'sinon';
import {requestJson, StatusCodeError} from '../../dist/http';

describe('http', () => {

    let fetchStub: sinon.SinonStub;
    const realFetch = (global as any).fetch;

    beforeEach(() => {
        fetchStub = sinon.stub();
        (global as any).fetch = fetchStub;
    });

    afterEach(() => {
        (global as any).fetch = realFetch;
    });

    const respond = (status: number, body?: object) => fetchStub.resolves({
        ok: status >= 200 && status < 300,
        status,
        text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
    });

    it('should send a JSON body and parse the JSON response', () => {
        respond(200, {code: 0, id: 'x'});
        return requestJson({url: 'http://h/a', method: 'POST', body: {id: 'x'}, headers: {'X-API-Key': 'k'}, json: true})
            .then((resp) => {
                expect(resp).to.eql({code: 0, id: 'x'});
                expect(fetchStub.firstCall.args[0]).to.eq('http://h/a');
                expect(fetchStub.firstCall.args[1]).to.eql({
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
                expect(fetchStub.firstCall.args[1]).to.eql({
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
            .then(() => expect.fail('should reject'), (err) => {
                expect(err).to.be.instanceOf(StatusCodeError);
                expect(err.name).to.eq('StatusCodeError');
                expect(err.statusCode).to.eq(503);
                expect(err.error).to.eql({message: 'down'});
                expect(err.message).to.eq('503 - {"message":"down"}');
            });
    });

});
