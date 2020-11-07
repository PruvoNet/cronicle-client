'use strict';

import * as qs from 'querystring';
import * as request from 'request-promise';
import {CronicleError} from './CronicleError';
import {
    IAbortJobRequest,
    IBasicResponse,
    ICreateEventRequest,
    ICreateEventResponse, IDeleteEventRequest, IErrorResponse,
    IGetEventRequest,
    IGetEventResponse, IGetHistoryRequest, IGetHistoryResponse,
    IGetJobStatusRequest,
    IGetJobStatusResponse, IGetScheduleRequest, IGetScheduleResponse,
    IRunEventRequest,
    IRunEventResponse,
    IUpdateEventRequest,
    IUpdateJobRequest,
} from './requestResponseTypes';
import {IBasePlugins} from './plugins';

const enum HttpMethods {
    POST = 'POST',
    GET = 'GET',
}

interface IBodyOrQuery {
    [key: string]: any;
}

export enum BaseTargets {
    ALL = 'allgrp',
    MAIN = 'maingrp',
}

export enum BaseCategories {
    GENERAL = 'general',
}

export interface ICronicleClientOptions {
    masterUrl: string;
    apiKey: string;
}

export class CronicleClient<Categories extends string = BaseCategories,
    Targets extends string = BaseTargets,
    Plugins = IBasePlugins> {

    private readonly _headers: any;
    private readonly _baseUrl: string;

    constructor(opts: ICronicleClientOptions) {
        if (!opts.masterUrl) {
            throw new Error('cronicle master url is required');
        }
        if (!opts.apiKey) {
            throw new Error('cronicle api key is required');
        }
        this._baseUrl = `${opts.masterUrl.replace(/\/$/, '')}/api/app`;
        this._headers = {
            'X-API-Key': opts.apiKey,
        };
    }

    public createEvent<Plugin extends keyof Plugins>(
        req: ICreateEventRequest<Plugin, Plugins, Targets, Categories>, enforceUnique?: boolean)
        : Promise<ICreateEventResponse> {
        return Promise.resolve()
            .then(() => {
                if (!enforceUnique) {
                    return Promise.resolve();
                }
                return this.getEvent(req.id ? {id: req.id} : {title: req.title})
                    .catch(() => {
                        return Promise.resolve();
                    })
                    .then((resp) => {
                        if (resp) {
                            return Promise.reject(new CronicleError({
                                code: 'unique',
                                description: 'event already exists',
                            }));
                        }
                        return Promise.resolve();
                    });
            })
            .then(() => {
                return this._executeRequest('create_event', HttpMethods.POST, req);
            });
    }

    public getEvent<Plugin extends keyof Plugins = any>(
        req: IGetEventRequest): Promise<IGetEventResponse<Plugin, Plugins, Targets, Categories>> {
        return this._executeRequest('get_event', HttpMethods.POST, req);
    }

    public getJobStatus<Plugin extends keyof Plugins = any>(
        req: IGetJobStatusRequest): Promise<IGetJobStatusResponse<Plugin, Plugins, Targets, Categories>> {
        return this._executeRequest('get_job_status', HttpMethods.GET, req);
    }

    public runEvent<Plugin extends keyof Plugins = any>(
        req: IRunEventRequest<Plugin, Plugins, Targets, Categories>): Promise<IRunEventResponse> {
        return this._executeRequest('run_event', HttpMethods.POST, req);
    }

    public updateEvent<Plugin extends keyof Plugins = any>(
        req: IUpdateEventRequest<Plugin, Plugins, Targets, Categories>): Promise<IBasicResponse> {
        return this._executeRequest('update_event', HttpMethods.POST, req);
    }

    public updateJob(req: IUpdateJobRequest): Promise<IBasicResponse> {
        return this._executeRequest('update_job', HttpMethods.POST, req);
    }

    public deleteEvent(req: IDeleteEventRequest): Promise<IBasicResponse> {
        return this._executeRequest('delete_event', HttpMethods.POST, req);
    }

    public abortJob(req: IAbortJobRequest): Promise<IBasicResponse> {
        return this._executeRequest('abort_job', HttpMethods.POST, req);
    }

    public getSchedule(req?: IGetScheduleRequest): Promise<IGetScheduleResponse<any, Plugins, Targets, Categories>> {
        return this._executeRequest('get_schedule', HttpMethods.GET, req);
    }

    public getHistory(req?: IGetHistoryRequest): Promise<IGetHistoryResponse<any, Plugins, Targets, Categories>> {
        return this._executeRequest('get_history', HttpMethods.GET, req);
    }

    private _executeRequest<T extends IBasicResponse>(operation: string, httpMethod: HttpMethods,
                                                      bodyOrQuery?: IBodyOrQuery): Promise<T> {
        return Promise.resolve(request(this._buildRequest(operation, httpMethod, bodyOrQuery)))
            .then((response: T | IErrorResponse) => {
                if (response.code !== 0) {
                    return Promise.reject(new CronicleError(response as IErrorResponse));
                }
                return Promise.resolve(response as T);
            });
    }

    private _buildRequest(operation: string, httpMethod: HttpMethods, bodyOrQuery?: IBodyOrQuery) {
        return {
            url: this._getMethodUrl(operation, httpMethod === HttpMethods.GET ? bodyOrQuery : undefined),
            method: httpMethod,
            body: httpMethod === HttpMethods.GET ? undefined : bodyOrQuery,
            json: true,
            headers: this._headers,
        };
    }

    private _getMethodUrl(operation: string, query?: IBodyOrQuery) {
        const queryString = `${query ? '?' : ''}${query ? qs.stringify(query) : ''}`;
        return `${this._baseUrl}/${operation}/v1${queryString}`;
    }
}
