'use strict';

import {getUtcTiming, getTiming, CronicleClient, SchedulerError} from '../../dist/';
import moment = require('moment');
import {expect} from 'chai';
import * as proxyquire from 'proxyquire';
// @ts-ignore
import * as sinon from 'sinon';
// @ts-ignore
import * as timezoneMock from 'timezone-mock';

const requestStub = sinon.stub();
(requestStub as any)['@global'] = true;
const stubs = {
    'request-promise': requestStub,
};
// tslint:disable-next-line
const allImports = proxyquire('../../dist/', stubs);
const cronicleClientStubbed: typeof CronicleClient = allImports.CronicleClient;
const cchedulerErrorStubbed: typeof SchedulerError = allImports.SchedulerError;

const masterUrl = 'http://my.croncicle.com:3012';
const apiKey = 'myApiKey';
const defaultVersion = 'v1';

describe('index', () => {

    describe('timing helpers ', () => {

        describe('utc timing helpers ', () => {

            it('should create timing object from moment', () => {
                const timing = getUtcTiming(moment.utc('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getUtcTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getUtcTiming('2016-05-26T14:50:50.900Z');
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

        });

        describe('non utc timing helpers ', () => {

            before(() => {
                timezoneMock.register('US/Pacific');
            });

            after(() => {
                timezoneMock.unregister();
            });

            it('should create timing object from moment', () => {
                const timing = getTiming(moment('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getTiming('2016-05-26T14:50:50.900Z');
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

        });

    });

    describe('cronicle client', () => {

        beforeEach(() => {
            requestStub.reset();
        });

        describe('constructor', () => {

            it('should fail if no master url is provided', (done) => {
                try {
                    new cronicleClientStubbed({apiKey} as any);
                } catch (error) {
                    expect(error.message).to.eql('cronicle master url is required');
                    done();
                }
            });

            it('should fail if no api key is provided', (done) => {
                try {
                    new cronicleClientStubbed({masterUrl} as any);
                } catch (error) {
                    expect(error.message).to.eql('cronicle api key is required');
                    done();
                }
            });
        });

        describe('methods', () => {

            describe('get event', () => {

                it('should get event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get event with title', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const title = 'myTitle';
                    return client.getEvent({title})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    title,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.getEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cchedulerErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

                it('should get event with custom api version', () => {
                    const apiVersion = 'v2';
                    const client = new cronicleClientStubbed({masterUrl, apiKey, apiVersion});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${apiVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

            });

            describe('run event', () => {

                it('should run event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/run_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should run event with title', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const title = 'myTtile';
                    const request = {
                        title,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/run_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should run event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.runEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cchedulerErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

                it('should run event with custom api version', () => {
                    const apiVersion = 'v2';
                    const client = new cronicleClientStubbed({masterUrl, apiKey, apiVersion});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/run_event/${apiVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

            });

            describe('delete event', () => {

                it('should delete event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.deleteEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/delete_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should delete event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.deleteEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cchedulerErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

                it('should delete event with custom api version', () => {
                    const apiVersion = 'v2';
                    const client = new cronicleClientStubbed({masterUrl, apiKey, apiVersion});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.deleteEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/delete_event/${apiVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

            });

            describe('abort job', () => {

                it('should abort job with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                    };
                    return client.abortJob(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/abort_job/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should abort job with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.abortJob({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cchedulerErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

                it('should abort job with custom api version', () => {
                    const apiVersion = 'v2';
                    const client = new cronicleClientStubbed({masterUrl, apiKey, apiVersion});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.abortJob(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/abort_job/${apiVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

            });

            describe('get job status', () => {

                it('should get job status with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getJobStatus({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_job_status/${defaultVersion}?id=${id}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get job status with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.getJobStatus({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cchedulerErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

                it('should get job status with custom api version', () => {
                    const apiVersion = 'v2';
                    const client = new cronicleClientStubbed({masterUrl, apiKey, apiVersion});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getJobStatus({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_job_status/${apiVersion}?id=${id}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

            });

        });

    });
});
