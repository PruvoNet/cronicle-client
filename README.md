[![Npm Version](https://img.shields.io/npm/v/cronicle-client.svg?style=popout)](https://www.npmjs.com/package/cronicle-client)
[![Build Status](https://travis-ci.org/PruvoNet/cronicle-client.svg?branch=master)](https://travis-ci.org/PruvoNet/cronicle-client)
[![Coverage Status](https://coveralls.io/repos/github/PruvoNet/cronicle-client/badge.svg?branch=master)](https://coveralls.io/github/PruvoNet/cronicle-client?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/58abd1713b064f4c9af7dc88d7178ebe)](https://www.codacy.com/app/regevbr/cronicle-client?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=PruvoNet/cronicle-client&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/PruvoNet/cronicle-client/badge.svg?targetFile=package.json)](https://snyk.io/test/github/PruvoNet/cronicle-client?targetFile=package.json)
[![dependencies Status](https://david-dm.org/PruvoNet/cronicle-client/status.svg)](https://david-dm.org/PruvoNet/cronicle-client)
[![devDependencies Status](https://david-dm.org/PruvoNet/cronicle-client/dev-status.svg)](https://david-dm.org/PruvoNet/cronicle-client?type=dev)

# Cronicle client 
Light [Croncile](https://github.com/jhuckaby/Cronicle) node client with full TypeScript support

## Main features
- Fully typed api client for Cronicle
- No dependencies (you need to install your own `request-promise` library)
- Helper methods to build Timing objects for scheduling events
- Type safety extendable for Categories, Plugins and Targets

## Install

```shell
npm install cronicle-client
```

--NOTICE--  
`request-promise` is a peer dependency and must be installed by you (>=3.0.0)

--NOTICE--  
If you want to use the timing objects helpers, you must also install `moment`

## Quick example

```typescript
import { CronicleClient, NumberedBoolean, BaseCategories, BaseTargets, getUtcTiming, 
 HttpPluginMethods, } from 'cronicle-client';

const scheduler = new CronicleClient({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});

scheduler.createEvent({
        plugin: 'urlplug',
        title: 'test event1',
        enabled: NumberedBoolean.TRUE,
        category: BaseCategories.GENERAL,
        target: BaseTargets.GENERAL,
        timing: getUtcTiming('2016-05-26T14:50:50.900Z'),
        timezone: 'Etc/UTC',
        params: {
          method: HttpPluginMethods.POST,
          timeout: '60',
          headers:  'Content-Type: application/json',
          data: JSON.stringify({ a: 1 }),
          url: 'https://requestbin.com',
        },
      })
      .then((data) => {
        console.log(`Created event with id: ${data.id}`);
        return scheduler.runEvent({ id: data.id });
      })
      .then((data) => {
        console.log(`Started event with job id: ${data.ids[0]}`);
      });
```

## Extending with custom types example

```typescript
import { CronicleClient, IHttpPluginData, IShellPluginData, ITestPluginData, NumberedBoolean,
    getUtcTiming } from 'cronicle-client';

export interface ICustomPluginData {
  duration: string;
  action: string;
}

export interface Plugins {
  // Default plugins
  urlplug: IHttpPluginData;
  shellplug: IShellPluginData;
  testplug: ITestPluginData;
  // Custom plugins
  mycustomplug: ICustomPluginData;
}

export enum Categories {
  // Default category
  GENERAL = 'general',
  // Custom categories...
  TEST_CATEGORY = 'cjw6g085901', 
  TEST_CATEGORY2 = 'cjw6l8mnb02',
}

export enum Targets {
    // Default targets...
    ALL = 'allgrp',
    MAIN = 'maingrp',
    // Custom targets...
    AWS = 'awsgrp',
    GCP = 'gcpgrp',
}

const scheduler = new CronicleClient<Categories, Targets, Plugins>({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});

scheduler.createEvent({
        plugin: 'mycustomplug',
        title: 'test event1',
        enabled: NumberedBoolean.TRUE,
        category: Categories.TEST_CATEGORY2,
        target: Targets.AWS,
        timing: getUtcTiming('2016-05-26T14:50:50.900Z'),
        timezone: 'Etc/UTC',
        params: {
          duration: '60',
          action: JSON.stringify({ a: 1 }),
        },
      })
      .then((data) => {
        console.log(`Created event with id: ${data.id}`);
        return scheduler.runEvent({ id: data.id });
      })
      .then((data) => {
        console.log(`Started event with job id: ${data.ids[0]}`);
      });
```

## Documentation

TBD

## Versions

Cronicle client supports Node 6 LTS and higher.

## Contributing

All contributions are happily welcomed!  
Please make all pull requests to the `master` branch from your fork and ensure tests pass locally.
