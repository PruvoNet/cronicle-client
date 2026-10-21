'use strict';

import * as http from 'http';
import {AddressInfo} from 'net';
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {
    BaseCategories,
    BaseTargets,
    basePlugins,
    CronicleClient,
    CronicleError,
    NumberedBoolean,
} from '../../src';
import {RequestError, StatusCodeError} from '../../src/http';

// No stubs: the real CronicleClient and the global fetch, against a local server that plays the Cronicle API.

interface IReceived {
    method: string;
    url: string;
    apiKey?: string;
    contentType?: string;
    body: any;
}

type Reply = (req: IReceived) => { status?: number, body?: object, raw?: string };

describe('CronicleClient over HTTP', () => {

    const apiKey = 'myApiKey';
    let server: http.Server;
    let masterUrl: string;
    let received: IReceived[];
    let reply: Reply;

    beforeAll(async () => {
        server = http.createServer((req, res) => {
            let raw = '';
            req.on('data', (chunk) => raw += chunk);
            req.on('end', () => {
                const entry: IReceived = {
                    method: req.method || '',
                    url: req.url || '',
                    apiKey: req.headers['x-api-key'] as string | undefined,
                    contentType: req.headers['content-type'],
                    body: raw ? JSON.parse(raw) : undefined,
                };
                received.push(entry);
                const out = reply(entry);
                res.statusCode = out.status || 200;
                res.setHeader('Content-Type', 'application/json');
                // Node 18's fetch keeps the socket for reuse, and its server.close() waits for idle sockets.
                res.setHeader('Connection', 'close');
                res.end(out.raw !== undefined ? out.raw : out.body === undefined ? '' : JSON.stringify(out.body));
            });
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
        masterUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    });

    beforeEach(() => {
        received = [];
        reply = () => ({body: {code: 0}});
    });

    const newClient = (url = masterUrl) => new CronicleClient({masterUrl: url, apiKey});

    const event = {
        title: 'myTitle',
        enabled: NumberedBoolean.TRUE,
        category: BaseCategories.GENERAL,
        target: BaseTargets.MAIN,
        plugin: basePlugins.shellplug,
        params: {script: 'echo hi', annotate: NumberedBoolean.FALSE, json: NumberedBoolean.FALSE},
    };

    describe('requests', () => {

        const postCases: Array<[string, (c: CronicleClient) => Promise<unknown>, string, object]> = [
            ['getEvent', (c) => c.getEvent({id: 'e1'}), 'get_event', {id: 'e1'}],
            ['runEvent', (c) => c.runEvent({id: 'e1'}), 'run_event', {id: 'e1'}],
            ['updateEvent', (c) => c.updateEvent({id: 'e1', title: 'new'}), 'update_event', {id: 'e1', title: 'new'}],
            ['deleteEvent', (c) => c.deleteEvent({id: 'e1'}), 'delete_event', {id: 'e1'}],
            ['updateJob', (c) => c.updateJob({id: 'j1', timeout: 30}), 'update_job', {id: 'j1', timeout: 30}],
            ['abortJob', (c) => c.abortJob({id: 'j1'}), 'abort_job', {id: 'j1'}],
            ['createEvent', (c) => c.createEvent(event), 'create_event', event],
        ];

        postCases.forEach(([name, call, operation, body]) => {
            it(`${name} should POST JSON to /api/app/${operation}/v1 with the API key`, async () => {
                await call(newClient());
                expect(received).to.have.length(1);
                expect(received[0]).to.eql({
                    method: 'POST',
                    url: `/api/app/${operation}/v1`,
                    apiKey,
                    contentType: 'application/json',
                    body,
                });
            });
        });

        const getCases: Array<[string, (c: CronicleClient) => Promise<unknown>, string]> = [
            ['getJobStatus', (c) => c.getJobStatus({id: 'j1'}), '/api/app/get_job_status/v1?id=j1'],
            ['getSchedule', (c) => c.getSchedule({offset: 10, limit: 5}), '/api/app/get_schedule/v1?offset=10&limit=5'],
            ['getSchedule without a query', (c) => c.getSchedule(), '/api/app/get_schedule/v1'],
            ['getHistory', (c) => c.getHistory({offset: 0, limit: 2}), '/api/app/get_history/v1?offset=0&limit=2'],
        ];

        getCases.forEach(([name, call, url]) => {
            it(`${name} should GET ${url} without a body`, async () => {
                await call(newClient());
                expect(received).to.have.length(1);
                expect(received[0]).to.eql({method: 'GET', url, apiKey, contentType: undefined, body: undefined});
            });
        });

        it('should not double the slash when masterUrl ends with one', async () => {
            await newClient(`${masterUrl}/`).getEvent({id: 'e1'});
            expect(received[0].url).to.eq('/api/app/get_event/v1');
        });

    });

    describe('responses', () => {

        it('should resolve with the parsed response body', async () => {
            reply = () => ({body: {code: 0, event: {id: 'e1', title: 'myTitle'}}});
            const resp = await newClient().getEvent({id: 'e1'});
            expect(resp).to.eql({code: 0, event: {id: 'e1', title: 'myTitle'}});
        });

        it('should reject with CronicleError when Cronicle answers a non-zero code', async () => {
            reply = () => ({body: {code: 'event', description: 'Failed to locate event: e9'}});
            const err = await newClient().runEvent({id: 'e9'}).then(() => undefined, (e) => e);
            expect(err).to.be.instanceOf(CronicleError);
            expect(err.code).to.eq('event');
            expect(err.message).to.eq('Failed to locate event: e9');
        });

        it('should reject with StatusCodeError on an HTTP error', async () => {
            reply = () => ({status: 500, body: {message: 'boom'}});
            const err = await newClient().abortJob({id: 'j1'}).then(() => undefined, (e) => e);
            expect(err).to.be.instanceOf(StatusCodeError);
            expect(err.statusCode).to.eq(500);
            expect(err.error).to.eql({message: 'boom'});
        });

        it('should reject with RequestError and the socket error when the server is down', async () => {
            const closed = http.createServer();
            await new Promise<void>((resolve) => closed.listen(0, '127.0.0.1', () => resolve()));
            const port = (closed.address() as AddressInfo).port;
            await new Promise<void>((resolve) => closed.close(() => resolve()));
            const err = await newClient(`http://127.0.0.1:${port}`).getEvent({id: 'e1'}).then(() => undefined, (e) => e);
            expect(err).to.be.instanceOf(RequestError);
            expect(err.code).to.eq('ECONNREFUSED');
            expect(err.message).to.contain('ECONNREFUSED');
        });

        it('should reject with StatusCodeError when an HTTP error body is not JSON', async () => {
            reply = () => ({status: 502, raw: '<html>Bad Gateway</html>'});
            const err = await newClient().getEvent({id: 'e1'}).then(() => undefined, (e) => e);
            expect(err).to.be.instanceOf(StatusCodeError);
            expect(err.statusCode).to.eq(502);
            expect(err.error).to.eq('<html>Bad Gateway</html>');
        });

    });

    describe('createEvent with enforceUnique', () => {

        it('should reject without creating when the event already exists', async () => {
            reply = () => ({body: {code: 0, event: {id: 'e1'}}});
            const err = await newClient().createEvent(event, true).then(() => undefined, (e) => e);
            expect(err).to.be.instanceOf(CronicleError);
            expect(err.code).to.eq('unique');
            expect(received.map((r) => r.url)).to.eql(['/api/app/get_event/v1']);
            expect(received[0].body).to.eql({title: 'myTitle'});
        });

        it('should create the event when the lookup finds nothing', async () => {
            reply = (req) => req.url.startsWith('/api/app/get_event')
                ? {body: {code: 'event', description: 'Failed to locate event'}}
                : {body: {code: 0, id: 'new1'}};
            const resp = await newClient().createEvent(event, true);
            expect(resp).to.eql({code: 0, id: 'new1'});
            expect(received.map((r) => r.url)).to.eql(['/api/app/get_event/v1', '/api/app/create_event/v1']);
        });

        it('should look the event up by id when the request has one', async () => {
            reply = (req) => req.url.startsWith('/api/app/get_event')
                ? {body: {code: 'event', description: 'Failed to locate event'}}
                : {body: {code: 0, id: 'e7'}};
            await newClient().createEvent({...event, id: 'e7'}, true);
            expect(received[0].body).to.eql({id: 'e7'});
        });

    });

});
