import type {
    TsundereCallback,
    TsundereTaskReport,
    TsundereCallback as Callback,
    TsundereTaskReport as TaskReport
} from './task'

import {
    TsundereTask,
    TsundereTask as Task,
    task,
    describe
} from './task'

export type {
    TsundereCallback,
    TsundereTaskReport,
    Callback,
    TaskReport
}

import {
    series,
    parallel,
    describeParallel,
    describeSeries,
    TsundereRunner,
    TsundereRunner as Runner
} from './runner'

export {
    TsundereRunner,
    TsundereTask,
    Runner,
    series,
    parallel,
    task,
    describe,
    Task,
    describeParallel,
    describeSeries
}

const _default = {
    TsundereRunner,
    TsundereTask,
    Runner,
    series,
    parallel,
    task,
    describe,
    Task,
    describeParallel,
    describeSeries
}

export default _default