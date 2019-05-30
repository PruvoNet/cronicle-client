'use strict';

import { IErrorResponse } from './requestResponseTypes';

export class SchedulerError extends Error {
  public code: 0 | number | string;

  constructor(resp: IErrorResponse) {
    super(resp.description);
    this.code = resp.code;
  }
}
