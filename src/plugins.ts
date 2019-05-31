'use strict';

import {IPluginNames, NumberedBoolean} from './helperTypes';

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

export interface IBasePlugins {
    urlplug: IHttpPluginData;
    shellplug: IShellPluginData;
    testplug: ITestPluginData;
}

export const basePlugins: IPluginNames<IBasePlugins> = {
    urlplug: 'urlplug',
    shellplug: 'shellplug',
    testplug: 'testplug',
};
