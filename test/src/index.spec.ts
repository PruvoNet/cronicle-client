'use strict';

import moment = require('moment');
import * as timezoneMock from 'timezone-mock';
import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {
    BaseCategories,
    basePlugins,
    BaseTargets,
    CronicleClient,
    CronicleError,
    getFutureTiming,
    getFutureUtcTiming,
    IHttpPluginData,
    IPluginNames,
    IShellPluginData,
    ITestPluginData,
    NumberedBoolean,
} from '../../src';
import {requestJson} from '../../src/http';

vi.mock('../../src/http', () => ({requestJson: vi.fn()}));
const requestStub = vi.mocked(requestJson);

const masterUrl = 'http://my.croncicle.com:3012';
const apiKey = 'myApiKey';
const defaultVersion = 'v1';

describe('cronicle client', () => {

    describe('timing helpers ', () => {

        describe('utc timing helpers ', () => {

            it('should create timing object from moment', () => {
                const timing = getFutureUtcTiming(moment.utc('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getFutureUtcTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getFutureUtcTiming('2016-05-26T14:50:50.900Z');
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

        });

        describe('non utc timing helpers ', () => {

            beforeAll(() => {
                timezoneMock.register('US/Pacific');
            });

            afterAll(() => {
                timezoneMock.unregister();
            });

            it('should create timing object from moment', () => {
                const timing = getFutureTiming(moment('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getFutureTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getFutureTiming('2016-05-26T14:50:50.900Z');
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
            requestStub.mockReset();
        });

        describe('constructor', () => {

            it('should fail if no master url is provided', () => {
                expect(() => new CronicleClient({apiKey} as any)).to.throw('cronicle master url is required');
            });

            it('should fail if no api key is provided', () => {
                expect(() => new CronicleClient({masterUrl} as any)).to.throw('cronicle api key is required');
            });
        });

        describe('typing', () => {

            beforeEach(() => {
                requestStub.mockResolvedValue({code: 0});
            });

            it('should allow extended plugins', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                const client = new CronicleClient<Categories>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY,
                    target: BaseTargets.MAIN,
                    plugin: basePlugins.shellplug,
                    params: {
                        script: 'myScript',
                        annotate: NumberedBoolean.FALSE,
                        json: NumberedBoolean.TRUE,
                    },
                    log_max_size: 30,
                };
                return client.createEvent(request);
            });

            it('should allow extended targets', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                enum Targets {
                    // Default targets...
                    ALL = 'allgrp',
                    MAIN = 'maingrp',
                    // Custom targets...
                    AWS = 'awsgrp',
                    GCP = 'gcpgrp',
                }
                const client = new CronicleClient<Categories, Targets>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY2,
                    target: Targets.AWS,
                    plugin: basePlugins.shellplug,
                    params: {
                        script: 'myScript',
                        annotate: NumberedBoolean.FALSE,
                        json: NumberedBoolean.TRUE,
                    },
                    log_max_size: 30,
                };
                return client.createEvent(request);
            });

            it('should allow extended plugins', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                enum Targets {
                    // Default targets...
                    ALL = 'allgrp',
                    MAIN = 'maingrp',
                    // Custom targets...
                    AWS = 'awsgrp',
                    GCP = 'gcpgrp',
                }
                interface ICustomPluginData {
                    duration: string;
                    action: string;
                }

                interface Plugins {
                    // Default plugins
                    urlplug: IHttpPluginData;
                    shellplug: IShellPluginData;
                    testplug: ITestPluginData;
                    // Custom plugins
                    mycustomplug: ICustomPluginData;
                }
                const plugins: IPluginNames<Plugins> = {
                    urlplug: 'urlplug',
                    shellplug: 'shellplug',
                    testplug: 'testplug',
                    mycustomplug: 'mycustomplug',
                };
                const client = new CronicleClient<Categories, Targets, Plugins>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY2,
                    target: Targets.AWS,
                    plugin: plugins.mycustomplug,
                    params: {
                        duration: 'myDiration',
                        action: 'myAction',
                    },
                    log_max_size: 30,
                };
                return client.createEvent(request);
            });

        });

        describe('methods', () => {

            describe('get event', () => {

                it('should get event with id and master url with trailing slash', () => {
                    const client = new CronicleClient({masterUrl: `${masterUrl}/`, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should get event with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const title = 'myTitle';
                    return client.getEvent({title})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should get event with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.getEvent({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('get schedule', () => {

                it('should get schedule with no params', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    return client.getSchedule()
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with offset', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const offset = 1;
                    return client.getSchedule({offset})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with limit', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const limit = 1;
                    return client.getSchedule({limit})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?limit=${limit}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with limit and offset', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const limit = 1;
                    const offset = 1;
                    return client.getSchedule({limit, offset})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?\
limit=${limit}&offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.getSchedule()
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('get history', () => {

                it('should get history with no params', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    return client.getHistory()
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_history/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get history with offset', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const offset = 1;
                    return client.getHistory({offset})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_history/${defaultVersion}?offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get history with limit', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const limit = 1;
                    return client.getHistory({limit})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_history/${defaultVersion}?limit=${limit}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get history with limit and offset', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const limit = 1;
                    const offset = 1;
                    return client.getHistory({limit, offset})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_history/${defaultVersion}?\
limit=${limit}&offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get history with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.getHistory()
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('run event', () => {

                it('should run event with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const title = 'myTtile';
                    const request = {
                        title,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should run event with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.runEvent({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('create event', () => {

                it('should create event', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const request = {
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with unique title', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValueOnce({code: 'not found', description: 'event with title not found'});
                    requestStub.mockResolvedValueOnce(response);
                    const title = 'myTitle';
                    const request = {
                        title,
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                            expect(requestStub.mock.calls[1][0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with error due to duplicate title', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    requestStub.mockResolvedValue({code: 0});
                    const title = 'myTitle';
                    const request = {
                        title,
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql('unique');
                            expect(error.message).to.eql('event already exists');
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                            expect(requestStub).toHaveBeenCalledTimes(1);
                        });
                });

                it('should create event with unique id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValueOnce({code: 'not found', description: 'event with id not found'});
                    requestStub.mockResolvedValueOnce(response);
                    const id = 'myId';
                    const request = {
                        id,
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                            expect(requestStub.mock.calls[1][0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with error due to duplicate id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    requestStub.mockResolvedValue({code: 0});
                    const id = 'myId';
                    const request = {
                        id,
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql('unique');
                            expect(error.message).to.eql('event already exists');
                            expect(requestStub.mock.calls[0][0]).to.eql({
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
                            expect(requestStub).toHaveBeenCalledTimes(1);
                        });
                });

                it('should create event with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    const request = {
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request)
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('update event', () => {

                it('should update event with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    const request = {
                        id,
                        timeout: 30,
                        reset_cursor: NumberedBoolean.TRUE,
                    };
                    return client.updateEvent(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/update_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should update event with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.updateEvent({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('update job', () => {

                it('should update job with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    const request = {
                        id,
                        timeout: 30,
                        reset_cursor: NumberedBoolean.TRUE,
                    };
                    return client.updateJob(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/update_job/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should update job with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.updateJob({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('delete event', () => {

                it('should delete event with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.deleteEvent(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should delete event with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.deleteEvent({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('abort job', () => {

                it('should abort job with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    const request = {
                        id,
                    };
                    return client.abortJob(request)
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should abort job with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.abortJob({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

            describe('get job status', () => {

                it('should get job status with id', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.mockResolvedValue(response);
                    const id = 'myId';
                    return client.getJobStatus({id})
                        .then((resp) => {
                            expect(requestStub.mock.calls[0][0]).to.eql({
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

                it('should get job status with error', () => {
                    const client = new CronicleClient({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.mockResolvedValue({code, description});
                    return client.getJobStatus({id})
                        .then(() => expect.unreachable('should reject'), (error) => {
                            expect(error).to.be.instanceOf(CronicleError);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                        });
                });

            });

        });

    });
});
