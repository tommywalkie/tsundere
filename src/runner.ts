import {TsundereTask, describe, task} from './task'
import type {TsundereTaskReport, TsundereCallback} from './task'
import {TsundereStore} from './store'

/**
 * Returns a standalone `TsundereTask` running registered sub-tasks in sequence.
 * @example
 * const suite = series([taskA, taskB])
 */
export async function series(tasks: TsundereTask[], props?: any): Promise<TsundereTaskReport[]> {
    const reports: TsundereTaskReport[] = []
    for (let i = 0; i < tasks.length; ++i) {
        await tasks[i].run(props).then(report => reports.push(report))
    }
    return reports
}

/**
 * Returns a standalone `TsundereTask` running registered sub-tasks in parallel.
 * @example
 * const suite = parallel([taskA, taskB, taskC])
 */
export async function parallel(tasks: TsundereTask[], props?: any): Promise<TsundereTaskReport[]> {
    return Promise.all(tasks.map(async (task: TsundereTask) => task.run(props)))
}

/**
 * Label a newly created concurrent `TsundereTask` suite
 */
export function describeParallel(name: string, tasks: TsundereTask[]) {
    const __task = __create_tasks(tasks, parallel)
    return describe(name, __create_tasks(tasks, __task))
}

/**
 * Label a newly created sequential `TsundereTask` suite
 */
export function describeSeries(name: string, tasks: TsundereTask[]) {
    const __task = __create_tasks(tasks, series)
    return describe(name, __task)
}

function __create_task(callback: TsundereCallback) {
    return async (props: any) => await callback(props)
}

function __create_tasks(tasks: TsundereTask[], handler: Function) {
    return async (props: any) => await handler(tasks, props)
}

/**
 * Stateful `TsundereTask` runner system, which provides a **Gulp**-like API
 * with `task`, `series` and `parallel` methods which register debiuggable tasks to be run
 * in parallel via `<TsundereRunner>.run()`
 * @example
 * import { TsundereRunner, task } from 'tsundere'
 * 
 * const runner = new TsundereRunner()
 * 
 * // Wait for milliseconds then resolve a Promise
 * function timeout(ms) {
 *   return new Promise(resolve => setTimeout(resolve, ms));
 * }
 * 
 * // Promise callback
 * function log(char) {
 *   console.log(char)
 *   return () => char
 * }
 * 
 * runner.task(async () => await timeout(1500).then(log('A')))
 * 
 * runner.series([
 *   task(async () => await timeout(1000).then(log('B'))),
 *   task(async () => await timeout(3000).then(log('C')))
 * ])
 * 
 * runner.parallel([
 *   task(async () => await timeout(700).then(log('D'))),
 *   task(async () => await timeout(1300).then(log('E')))
 * ])
 * 
 * // This will log 'D' -> 'B' -> 'A' -> 'E' -> 'C' ...
 * ;(async () => await runner.run().then(report => {
 *     // ... Then the task suite report.
 *     console.log(report)
 * }))()
 * 
 */
export class TsundereRunner extends TsundereStore {
    /**
     * Registered findable tasks inside the task runner
     */
    tasks: TsundereTask[] = []
    private __seq: TsundereTaskReport[] = []
    // TODO: This method needs some cleanup, or replacement.
    private __auto_sub(action: TsundereCallback) {
        this.tasks.push(this.__auto_sub_end(task(action)))
        return this
    }
    // TODO: This method needs some cleanup, or replacement.
    private __auto_sub_task(task: TsundereTask) {
        this.tasks.push(this.__auto_sub_end(task))
        return this
    }
    // TODO: This method needs some cleanup, or replacement.
    private __auto_sub_end(job: TsundereTask) {
        job.once('end', (props: any) => this.__seq.push(props.report))
        return job
    }
    // TODO: This method needs some cleanup, or replacement.
    private async __group_task(tasks: TsundereTask[], callback: Function) {
        this.__group_auto_sub_task(tasks)
        return this.__auto_sub(__create_tasks(tasks, callback))
    }
    // TODO: This method needs some cleanup, or replacement.
    private __group_auto_sub_task(tasks: TsundereTask[]) {
        for (let i = 0, len = tasks.length; i < len; i++)
            this.__auto_sub_end(tasks[i])
    }
    /**
     * Add new nameless task for the task runner instance
     */
    task = (callback: TsundereCallback) => {
        return this.__auto_sub(__create_task(callback))
    }
    /**
     * Label and register a newly created single task.
     * 
     * ```js
     * import { TsundereRunner } from 'tsundere'
     * const runner = new TsundereRunner()
     * runner.describe('my-task', async () => { ... })
     * ```
     * 
     * It is possible to register concurrent and sequential task suites,
     * but if you need to register their actual sub-tasks and make them appear in the
     * final report, you may use `describeSeries` or `describeParallel`
     * instead.
     * 
     * ```js
     * import { TsundereRunner, describeSeries, describe, series } from 'tsundere'
     * const runner = new TsundereRunner()
     *  
     * runner.describe('suite-A', async () => await series[  // ✅ Registered
     *   describe('task-A', async () => { ... }),           // ❌ Not registered
     *   describe('task-B', async () => { ... })            // ❌ Not registered
     * ])
     * 
     * runner.describeSeries('suite-B', [            // ✅ Registered
     *   describe('task-C', async () => { ... }),   // ✅ Registered
     *   describe('task-D', async () => { ... }),   // ✅ Registered
     * ])
     * ```
     * 
     */
    describe = async (name: string, callback: TsundereCallback) => 
        await this.__auto_sub_task(describe(name, __create_task(callback)))
    /**
     * Label and register a newly created task **and** its concurrent sub-tasks,
     * whether they are labelled or not,
     * 
     * @example
     * ```js
     * import { TsundereRunner, describe, task } from 'tsundere'
     * const runner = new TsundereRunner()
     * runner.describeParallel('my-parralel-tasks', [
     *    task(async () => { ... }),
     *    describe('some-task', async () => { ... }),
     * ])
     * ```
     */
    describeParallel = async (name: string, tasks: TsundereTask[]) => {
        this.__group_auto_sub_task(tasks)
        return await this.describe(name, async () => await parallel(tasks))
    }
    /**
     * Label and register a newly created task **and** its sequential sub-tasks,
     * whether they are labelled or not,
     * 
     * @example
     * ```js
     * import { TsundereRunner, describe, task } from 'tsundere'
     * const runner = new TsundereRunner()
     * runner.describeSeries('my-parralel-tasks', [
     *    task(async () => { ... }),
     *    describe('some-task', async () => { ... }),
     * ])
     * ```
     */
    describeSeries = async (name: string, tasks: TsundereTask[]) => {
        this.__group_auto_sub_task(tasks)
        return await this.describe(name, async () => await series(tasks))
    }
    /**
     * Register newly created task **and** its concurrent sub-tasks
     */
    parallel = async (tasks: TsundereTask[]) => await this.__group_task(tasks, parallel)
    /**
     * Register newly created task **and** its sequential sub-tasks
     */
    series = async (tasks: TsundereTask[]) => await this.__group_task(tasks, series)
    /**
     * Run registered tasks in parallel
     */
    run = async () => await parallel(this.tasks).then(_ => this.__seq)
}