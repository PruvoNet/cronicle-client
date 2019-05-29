'use strict';

import { NumberedBoolean } from './HelperTypes';

export enum HttpPluginMethods {
  POST = 'POST',
  GET = 'GET',
  HEAD = 'HEAD',
}

export interface IHttpPluginData {
  method: HttpPluginMethods;
  url: string;
  headers?: string;
  data?: string;
  timeout?: string;
  follow?: NumberedBoolean;
  ssl_cert_bypass?: NumberedBoolean;
  success_match?: string;
  error_match?: string;
}

export interface IShellPluginData {
  script: string;
  annotate: NumberedBoolean;
  json: NumberedBoolean;
}

export interface ITestPluginData {
  duration: string;
  progress: NumberedBoolean;
  burn: NumberedBoolean;
  action: string;
}

export interface IPlugins {
  urlplug: IHttpPluginData;
  shellplug: IShellPluginData;
  testplug: ITestPluginData;
}
