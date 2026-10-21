'use strict';

import MomentNamespace = require('moment');
import {Days, Hours, ITiming, Minutes, Months} from './dataTypes';

/**
 * The part of a moment.js `Moment` the timing helpers use. A `Moment` fits it, and the public
 * types need no `moment` import, so consumers without `moment` still type-check.
 */
export interface IMomentLike {
    get(unit: 'year' | 'month' | 'date' | 'hour' | 'minute'): number;
    utc(): IMomentLike;
}

let _moment: typeof MomentNamespace;

const _getMoment = (): typeof MomentNamespace => {
    _moment = _moment || require('moment');
    return _moment;
};

const _getTiming = (date: IMomentLike): ITiming => {
    return {
        years: [date.get('year')],
        months: [date.get('month') + 1 as Months],
        days: [date.get('date') as Days],
        hours: [date.get('hour') as Hours],
        minutes: [date.get('minute') as Minutes],
    };
};

const _isDateInput = (date: IMomentLike | Date | string): date is Date | string =>
    typeof date === 'string' || date instanceof Date;

export const getFutureTiming = (date: IMomentLike | Date | string): ITiming => {
    return _getTiming(_isDateInput(date) ? _getMoment()(date) : date);
};

export const getFutureUtcTiming = (date: IMomentLike | Date | string): ITiming => {
    return _getTiming(_isDateInput(date) ? _getMoment().utc(date) : date.utc());
};
