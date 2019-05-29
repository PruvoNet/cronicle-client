'use strict';

import { ICreatedEvent, IEvent, IJob } from './DataTypes';
import { NumberedBoolean, RecursivePartial } from './HelperTypes';

export interface ICreateEventRequest<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> extends Partial<IEvent<Plugin, Plugins, Targets, Categories>> {
  title: string;
  enabled: NumberedBoolean;
  category: Categories;
  target: Targets;
  plugin: Plugin;
  params: Plugins[Plugin];
}

export interface IIdRequest {
  id: string;
}

export interface ITitleRequest {
  title: string;
}

export type IdOrTitleRequest = IIdRequest | ITitleRequest;

export type IGetEventRequest = IdOrTitleRequest;

export type IGetJobStatusRequest = IIdRequest;

export type IRunEventRequest<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> =
  IdOrTitleRequest
  & RecursivePartial<IEvent<Plugin, Plugins, Targets, Categories>>;

export type IUpdateEventRequest<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> =
  IIdRequest & { reset_cursor?: NumberedBoolean; abort_jobs?: NumberedBoolean }
  & RecursivePartial<IEvent<Plugin, Plugins, Targets, Categories>>;

export type IUpdateJobRequest =
  IIdRequest &
  {
    timeout?: number;
    retries?: number;
    retry_delay?: number;
    chain?: string;
    chain_error?: string;
    notify_success?: string;
    notify_fail?: string;
    web_hook?: string;
    cpu_limit?: number;
    cpu_sustain?: number;
    memory_limit?: number;
    memory_sustain?: number;
    log_max_size?: number;
  };

export type IDeleteEventRequest = IIdRequest;
export type IAbortJobRequest = IIdRequest;

export interface IGetScheduleRequest {
  offset?: number;
  limit?: number;
}

export interface IBasicResponse {
  code: 0 | number | string;
}

export interface IErrorResponse extends IBasicResponse {
  description: string;
}

export interface ICreateEventResponse extends IBasicResponse {
  id: string;
}

export interface IGetScheduleResponse<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> extends IBasicResponse {
  rows: Array<ICreatedEvent<Plugin, Plugins, Targets, Categories>>;
  list: {
    page_size: number;
    first_page: number;
    last_page: number;
    length: number;
    type: 'list'
  };
}

export interface IRunEventResponse extends IBasicResponse {
  ids: string[];
  queue?: number;
}

export interface IGetEventResponse<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> extends IBasicResponse {
  event: ICreatedEvent<Plugin, Plugins, Targets, Categories>;
}

export interface IGetJobStatusResponse<Plugin extends keyof Plugins,
  Plugins,
  Targets extends string,
  Categories extends string> extends IBasicResponse {
  job: IJob<Plugin, Plugins, Targets, Categories>;
}
