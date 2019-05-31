'use strict';

import {NumberedBoolean} from './helperTypes';

export enum Algorithms {
    RANDOM = 'random',
    RR = 'round_robin',
    LEAST_CPU = 'least_cpu',
    LEAST_MEM = 'least_mem',
    PREFER_FIRST = 'prefer_first',
    PREFER_LAST = 'prefer_last',
    MULTIPLEX = 'multiplex',
}

export type Weekdays = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Months = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type Days =
    1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31;
export type Minutes =
    0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56
    | 57
    | 58
    | 59;
export type Hours =
    0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23;

export interface ITiming {
    minutes?: Minutes[];
    hours?: Hours[];
    weekdays?: Weekdays[];
    days?: Days[];
    months?: Months[];
    years?: number[];
}

export interface IJob<Plugin extends keyof Plugins,
    Plugins,
    Targets extends string,
    Categories extends string> {
    hostname: string;
    event: string;
    source: string;
    log_file: string;
    log_file_size: number;
    time_end: number;
    elapsed: number;
    pid: number;
    now: number;
    time_start: number;
    plugin: Plugin;
    category: Categories;
    timeout: number;
    retries: number;
    retry_delay: number;
    catch_up: NumberedBoolean;
    queue: NumberedBoolean;
    web_hook: string;
    queue_max: number;
    notes: string;
    notify_fail: string;
    notify_success: string;
    timezone: string;
    params: Plugins[Plugin];
    id: string;
    event_title: string;
    plugin_title: string;
    category_title: string;
    nice_target: string;
    command: string;
    type: string;
    description?: string;
    complete?: NumberedBoolean;
    code?: NumberedBoolean;
    progress?: number;
    cpu?: {
        min: number;
        max: number;
        total: number;
        count: number;
        current: number;
    };
    mem?: {
        min: number;
        max: number;
        total: number;
        count: number;
        current: number;
    };
    perf?: {
        scale?: number;
        counters: { [k: string]: number; };
        perf: { [k: string]: number; };
    };

}

export interface ICreatedEvent<Plugin extends keyof Plugins,
    Plugins,
    Targets extends string,
    Categories extends string> extends IEvent<Plugin, Plugins, Targets, Categories> {
    api_key: string;
    created: number;
    modified: number;
    id: string;
    username: string;
}

export interface IEvent<Plugin extends keyof Plugins, Plugins, Targets extends string, Categories extends string> {
    algo: Algorithms;
    catch_up: NumberedBoolean;
    category: Categories;
    chain: string;
    chain_error: string;
    timezone: string;
    cpu_limit: number;
    cpu_sustain: number;
    detached: NumberedBoolean;
    enabled: NumberedBoolean;
    multiplex: NumberedBoolean;
    queue: NumberedBoolean;
    log_max_size: number;
    max_children: number;
    queue_max: number;
    retries: number;
    timeout: number;
    retry_delay: number;
    stagger: number;
    memory_limit: number;
    memory_sustain: number;
    notes: string;
    notify_fail: string;
    notify_success: string;
    params: Plugins[Plugin];
    plugin: Plugin;
    target: Targets;
    title: string;
    web_hook: string;
    timing: ITiming | false;
}
