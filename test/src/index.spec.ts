'use strict';

import {CronicleClient} from '../../dist/';
import moment = require('moment');
import {expect} from 'chai';

describe('index', () => {

    describe('timing helpers ', () => {

        it('should create timing object from moment', () => {
            const timing = CronicleClient.getUtcTiming(moment.utc('2016-05-26T14:50:50.900Z'));
            expect(timing.years![0]).to.eq(2016);
            expect(timing.months![0]).to.eq(5);
            expect(timing.days![0]).to.eq(26);
            expect(timing.hours![0]).to.eq(14);
            expect(timing.minutes![0]).to.eq(50);
        });

        it('should create timing object from date', () => {
            const timing = CronicleClient.getUtcTiming(new Date('2016-05-26T14:50:50.900Z'));
            expect(timing.years![0]).to.eq(2016);
            expect(timing.months![0]).to.eq(5);
            expect(timing.days![0]).to.eq(26);
            expect(timing.hours![0]).to.eq(14);
            expect(timing.minutes![0]).to.eq(50);
        });

        it('should create timing object from string', () => {
            const timing = CronicleClient.getUtcTiming('2016-05-26T14:50:50.900Z');
            expect(timing.years![0]).to.eq(2016);
            expect(timing.months![0]).to.eq(5);
            expect(timing.days![0]).to.eq(26);
            expect(timing.hours![0]).to.eq(14);
            expect(timing.minutes![0]).to.eq(50);
        });

    });
});
