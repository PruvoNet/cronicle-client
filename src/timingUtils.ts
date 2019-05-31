'use strict';

import {Moment} from 'moment';
import MomentNamespace = require('moment');
import {Days, Hours, ITiming, Minutes, Months} from './dataTypes';

let _moment: typeof MomentNamespace;

const _getMoment = (): typeof MomentNamespace => {
    _moment = _moment || require('moment');
    return _moment;
};

const _getTiming = (date: Moment): ITiming => {
    return {
        years: [date.get('year')],
        months: [date.get('month') + 1 as Months],
        days: [date.get('date') as Days],
        hours: [date.get('hour') as Hours],
        minutes: [date.get('minute') as Minutes],
    };
};

export const getTiming = (date: Moment | Date | string): ITiming => {
    const moment = _getMoment();
    if (!moment.isMoment(date)) {
        date = moment(date);
    }
    return _getTiming(date);
};

export const getUtcTiming = (date: Moment | Date | string): ITiming => {
    const moment = _getMoment();
    if (!moment.isMoment(date)) {
        date = moment.utc(date);
    }
    return _getTiming(date.utc());
};
