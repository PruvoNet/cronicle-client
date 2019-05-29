'use strict';

import * as qs from 'querystring';
import * as request from 'request-promise';
import {SchedulerError} from './SchedulerError';
import {IPlugins} from './Plugins';
import {
    IAbortJobRequest,
    IBasicResponse,
    ICreateEventRequest,
    ICreateEventResponse, IDeleteEventRequest, IErrorResponse,
    IGetEventRequest,
    IGetEventResponse,
    IGetJobStatusRequest,
    IGetJobStatusResponse, IGetScheduleRequest, IGetScheduleResponse,
    IRunEventRequest,
    IRunEventResponse,
    IUpdateEventRequest,
    IUpdateJobRequest,
} from './RequestResponseTypes';
import {Moment} from 'moment';
import MomentNamespace = require('moment');
import {ITiming} from './DataTypes';

export interface ISchedulerOptions {
    masterUrl: string;
    apiKey: string;
    apiVersion?: string;
}

const enum HttpMethods {
    POST = 'POST',
    GET = 'GET',
}

export enum BaseTargets {
    ALL = 'allgrp',
    MAIN = 'maingrp',
}

export enum BaseCategories {
    GENERAL = 'general',
}

interface IBody {
    [key: string]: any;
}

export class CronicleClient<Categories extends string = BaseCategories,
    Targets extends string = BaseTargets,
    Plugins = IPlugins> {

    public static getTiming(date: Moment | Date | string): ITiming {
        const moment = this._getMoment();
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        return this._getTiming(date);
    }

    public static getUtcTiming(date: Moment | Date | string): ITiming {
        const moment = this._getMoment();
        if (!moment.isMoment(date)) {
            date = moment.utc(date);
        }
        return this._getTiming(date.utc());
    }

    private static readonly DEFAULT_API_VERSION = 'v1';
    private static moment: typeof MomentNamespace;

    private static _getMoment(): typeof MomentNamespace {
        this.moment = this.moment || require('moment');
        return this.moment;
    }

    private static _getTiming(date: Moment): ITiming {
        return {
            years: [date.get('year')],
            months: [date.get('month') + 1],
            days: [date.get('date')],
            hours: [date.get('hour')],
            minutes: [date.get('minute')],
        };
    }

    private readonly headers: any;
    private readonly baseUrl: string;
    private readonly apiVersion: string;

    constructor(opts: ISchedulerOptions) {
        if (!opts.masterUrl) {
            throw new Error('cronicle master url is required');
        }
        if (!opts.apiKey) {
            throw new Error('cronicle api key is required');
        }
        this.baseUrl = `${opts.masterUrl.replace(/\/$/, '')}/api/app`;
        this.apiVersion = opts.apiVersion || CronicleClient.DEFAULT_API_VERSION;
        this.headers = {
            'X-API-Key': opts.apiKey,
        };
    }

    public createEvent<Plugin extends keyof Plugins>(
        req: ICreateEventRequest<Plugin, Plugins, Targets, Categories>, enforceUniqueTitle?: boolean)
        : Promise<ICreateEventResponse> {
        return Promise.resolve()
            .then(() => {
                if (!enforceUniqueTitle) {
                    return Promise.resolve();
                }
                return this.getEvent({title: req.title})
                    .catch(() => {
                        return Promise.resolve();
                    })
                    .then((resp) => {
                        if (resp) {
                            return Promise.reject(new SchedulerError({
                                code: 'unique',
                                description: 'event already exists',
                            }));
                        }
                        return Promise.resolve();
                    });
            })
            .then(() => {
                return this.executeRequest('create_event', HttpMethods.POST, req);
            });
    }

    public getEvent<Plugin extends keyof Plugins = any>(
        req: IGetEventRequest): Promise<IGetEventResponse<Plugin, Plugins, Targets, Categories>> {
        return this.executeRequest('get_event', HttpMethods.POST, req);
    }

    public getJobStatus<Plugin extends keyof Plugins = any>(
        req: IGetJobStatusRequest): Promise<IGetJobStatusResponse<Plugin, Plugins, Targets, Categories>> {
        return this.executeRequest('get_job_status', HttpMethods.GET, req);
    }

    public runEvent<Plugin extends keyof Plugins = any>(
        req: IRunEventRequest<Plugin, Plugins, Targets, Categories>): Promise<IRunEventResponse> {
        return this.executeRequest('run_event', HttpMethods.POST, req);
    }

    public updateEvent<Plugin extends keyof Plugins = any>(
        req: IUpdateEventRequest<Plugin, Plugins, Targets, Categories>): Promise<IBasicResponse> {
        return this.executeRequest('update_event', HttpMethods.POST, req);
    }

    public updateJob(req: IUpdateJobRequest): Promise<IBasicResponse> {
        return this.executeRequest('update_job', HttpMethods.POST, req);
    }

    public deleteEvent(req: IDeleteEventRequest): Promise<IBasicResponse> {
        return this.executeRequest('delete_event', HttpMethods.POST, req);
    }

    public abortJob(req: IAbortJobRequest): Promise<IBasicResponse> {
        return this.executeRequest('abort_job', HttpMethods.POST, req);
    }

    public getSchedule(req?: IGetScheduleRequest): Promise<IGetScheduleResponse<any, Plugins, Targets, Categories>> {
        return this.executeRequest('get_schedule', HttpMethods.GET, req);
    }

    private executeRequest<T extends IBasicResponse>(op: string, method: HttpMethods, bodyOrQuery?: IBody): Promise<T> {
        return Promise.resolve(request(this.buildRequest(op, method, bodyOrQuery)))
            .then((response: T | IErrorResponse) => {
                if (response.code !== 0) {
                    return Promise.reject(new SchedulerError(response as IErrorResponse));
                }
                return Promise.resolve(response as T);
            });
    }

    private buildRequest(op: string, method: HttpMethods, bodyOrQuery?: IBody) {
        return {
            url: this.getMethodUrl(op, method === HttpMethods.GET ? bodyOrQuery : undefined),
            method,
            body: method === HttpMethods.GET ? undefined : bodyOrQuery,
            json: true,
            headers: this.headers,
        };
    }

    private getMethodUrl(op: string, query?: IBody) {
        return `${this.baseUrl}/${op}/${this.apiVersion}${query ? '?' : ''}${query ? qs.stringify(query) : ''}`;
    }
}
