'use strict';

import { NumberedBoolean } from './HelperTypes';

export enum Algorithms {
  RANDOM = 'random',
  RR = 'round_robin',
  LEAST_CPU = 'least_cpu',
  LEAST_MEM = 'least_mem',
  PREFER_FIRST = 'prefer_first',
  PREFER_LAST = 'prefer_last',
  MULTIPLEX = 'multiplex',
}

export interface ITiming {
  minutes?: number[];
  hours?: number[];
  weekdays?: number[];
  days?: number[];
  months?: number[];
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
