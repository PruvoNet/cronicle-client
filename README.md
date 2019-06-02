[![Npm Version](https://img.shields.io/npm/v/cronicle-client.svg?style=popout)](https://www.npmjs.com/package/cronicle-client)
[![Build Status](https://travis-ci.org/PruvoNet/cronicle-client.svg?branch=master)](https://travis-ci.org/PruvoNet/cronicle-client)
[![Coverage Status](https://coveralls.io/repos/github/PruvoNet/cronicle-client/badge.svg?branch=master)](https://coveralls.io/github/PruvoNet/cronicle-client?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/58abd1713b064f4c9af7dc88d7178ebe)](https://www.codacy.com/app/regevbr/cronicle-client?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=PruvoNet/cronicle-client&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/PruvoNet/cronicle-client/badge.svg?targetFile=package.json)](https://snyk.io/test/github/PruvoNet/cronicle-client?targetFile=package.json)
[![dependencies Status](https://david-dm.org/PruvoNet/cronicle-client/status.svg)](https://david-dm.org/PruvoNet/cronicle-client)
[![devDependencies Status](https://david-dm.org/PruvoNet/cronicle-client/dev-status.svg)](https://david-dm.org/PruvoNet/cronicle-client?type=dev)

<p align="center">
  <img src="https://github.com/PruvoNet/cronicle-client/blob/master/.github/logo.png?raw=true" />
</p>


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
`request-promise` is a peer dependency and must be installed by you (>=1.0.0)

--NOTICE--  
If you want to use the timing utils, you must also install `moment`

## Quick example

```typescript
import { CronicleClient, NumberedBoolean, BaseCategories, BaseTargets, getFutureUtcTiming, 
 HttpPluginMethods, basePlugins, CronicleError, TargetAlgorithms} from 'cronicle-client';

const scheduler = new CronicleClient({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});

scheduler.createEvent({
        plugin: basePlugins.urlplug,
        title: 'test event1',
        enabled: NumberedBoolean.TRUE,
        algo: TargetAlgorithms.RANDOM,
        category: BaseCategories.GENERAL,
        target: BaseTargets.GENERAL,
        timing: getFutureUtcTiming('2016-05-26T14:50:50.900Z'),
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
      })
      .catch((err: CronicleError) => {
        console.log(`Cronicle error: ${err.code} - ${err.message}`);
      });
```

## Extending with custom types example

```typescript
import { CronicleClient, IHttpPluginData, IShellPluginData, ITestPluginData, NumberedBoolean,
    getFutureUtcTiming, IPluginNames, CronicleError, TargetAlgorithms } from 'cronicle-client';

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

const plugins: IPluginNames<Plugins> = {
    urlplug: 'urlplug',
    shellplug: 'shellplug',
    testplug: 'testplug',
    mycustomplug: 'mycustomplug',
};

const scheduler = new CronicleClient<Categories, Targets, Plugins>({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});

scheduler.createEvent({
        plugin: plugins.mycustomplug,
        title: 'test event1',
        enabled: NumberedBoolean.TRUE,
        algo: TargetAlgorithms.RANDOM,
        category: Categories.TEST_CATEGORY2,
        target: Targets.AWS,
        timing: getFutureUtcTiming('2016-05-26T14:50:50.900Z'),
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
      })
      .catch((err: CronicleError) => {
        console.log(`Cronicle error: ${err.code} - ${err.message}`);
      });
```

## Documentation

### Methods

For all api endpoints documentations, please refer to [Cronicle api reference](https://github.com/jhuckaby/Cronicle#api-reference)

#### createEvent

When creating an event, there is no unique restriction on the title/id.  
While searching for an event using `getEvent`, the
api allows you to search by title/id, which is great, but as of now (cronicle v0.89) it will return a single result.  
This imposes an issue when you don't enforce a unique title/id since you will get a random result (see [#186](https://github.com/jhuckaby/Cronicle/issues/186))  
Until this behaviour is fixed, you can tell the `createEvent` method to enforce uniqueness and it will fail if an event with the provided title/id already exists.  
Note: if `id` is provided - it will be used as the unique key, otherwise `title` will be used.

### Error handling

`Croncile` will always return a valid HTTP response (code `200`).  
To raise an error, the `code` property of the response will be different than `0`.  
In such cases, the current method will be rejected with `CronicleError` with the proper error message and the 
`code` property.

### Constructor

#### Options

| Parameter Name | Description |
|----------------|-------------|
| `masterUrl`    | The full url to the master Cronicle server
| `apiKey`       | The api key to use (make sure it has relevant permissions enabled)

#### Typings

The client can  enforce the proper usage of categories, targets and plugins (with their required parameters).  
This is done using optional generics:  

| Generics Parameter Name  | Description |
|--------------------------|-------------|
| `Categories`             | Enum containing the ids of the categories available at you Cronicle server (Defaults to `BaseCategories`)
| `Targets`                | Enum containing the ids of the targets available at you Cronicle server (Defaults to `BaseTargets`)
| `Plugins`                | Interface containing mapping between plugin ids and the interface representing their required event params (Defaults to `IBasePlugins`)

#### Examples

Example constructor with defaults:
```typescript
const scheduler = new CronicleClient({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});
```

Example for setting the categories your server supports:
```typescript
enum Categories {
  // Default category
  GENERAL = 'general',
  // Custom categories...
  TEST_CATEGORY = 'cjw6g085901', 
  TEST_CATEGORY2 = 'cjw6l8mnb02',
}
```

Example for setting the targets your server supports:
```typescript
enum Targets {
    // Default targets...
    ALL = 'allgrp',
    MAIN = 'maingrp',
    // Custom targets...
    AWS = 'awsgrp',
    GCP = 'gcpgrp',
}
```

Example for setting the plugins your server supports:
```typescript
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
```

Example constructor with overrides:
```typescript
const scheduler = new CronicleClient<Categories, Targets, Plugins>({
  masterUrl: 'http://localhost:3012',
  apiKey: '<your api key>',
});
```

### Timing utils

To support a wide variety of scheduling, the [timing object](https://github.com/jhuckaby/Cronicle#event-timing-object)
an be very cumbersome...  
To make life easier (at least when you just want to schedule an event for a single future run) you can use the 
`getFutureTiming` and `getFutureUtcTiming` methods:

--NOTICE--  
If you want to use the timing utils, you MUST `npm install --save moment`

Running:
```typescript
getFutureUtcTiming(moment.utc('2016-05-26T14:50:50.900Z');
```

Will produce:
```json
{ 
  "years": [ 2016 ],
  "months": [ 5 ],
  "days": [ 26 ],
  "hours": [ 14 ],
  "minutes": [ 50 ]
}
```

## Versions

Cronicle client supports Node 6 LTS and higher.

## Contributing

All contributions are happily welcomed!  
Please make all pull requests to the `master` branch from your fork and ensure tests pass locally.
