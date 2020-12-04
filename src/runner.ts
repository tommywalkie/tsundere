import {TsundereTask, namedTask, task} from './task'
import type {TsundereTaskReport, TsundereCallback} from './task'

/**
 * Standalone and sequential `TsundereTask` runner, can be run without the need
 * of a `TsundereRunner` instance.
 * @example
 * const suite = series([taskA, taskB])
 * ;(async() => await suite())
 */
export async function series(tasks: TsundereTask[]): Promise<TsundereTaskReport[]> {
    const reports: TsundereTaskReport[] = []
    return await tasks.reduce(async (
        previousPromise: any,
        nextPromise: TsundereTask,
        currentIndex: number
    ) => {
        if (!currentIndex) {
            const result = await nextPromise.run()
            reports.push(result)
            return result
        }
        return await previousPromise.then(async (result: TsundereTaskReport) => {
            reports.push(result)
            return await nextPromise.run()
        })
    }, Promise.resolve()).then((result: TsundereTaskReport) => {
        return (tasks.length == 1) ? [result] : reports
    })
}

/**
 * Standalone, stateless and parallel `TsundereTask` runner, can be run without the need
 * of a `TsundereRunner` instance.
 * @example
 * const suite = parallel([taskA, taskB, taskC])
 * ;(async() => await suite())
 */
export async function parallel(tasks: TsundereTask[]): Promise<TsundereTaskReport[]> {
    return Promise.all(tasks.map(async (task: TsundereTask) => task.run()))
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
 * runner.task('my-task', async () => { setTimeout(() => { console.log('A') }, 4000) })
 * 
 * runner.series([
 *   task(async () => { setTimeout(() => { console.log('B') }, 1000) }),
 *   task(async () => { setTimeout(() => { console.log('C') }, 3500) })
 * ])
 * 
 * runner.parallel([
 *   task(async () => { setTimeout(() => { console.log('D') }, 2000) }),
 *   task(async () => { setTimeout(() => { console.log('E') }, 2500) })
 * ])
 * 
 * ;(async() => await runner.run())
 * 
 * // => 'B' (~1s) 
 * // => 'D' (~2s)
 * // => 'E' (~2.5s)
 * // => 'A' (~4s)
 * // => 'C' (~4.5s)
 */
export class TsundereRunner {
    /**
     * Registered findable tasks inside the task runner
     */
    tasks: TsundereTask[] = []
    /**
     * Add new named task for the task runner instance
     */
    task = (name: string, callback: TsundereCallback) => {
        this.tasks.push(namedTask(name, async () => 
            await callback()))
        return this
    }
    /**
     * Add new task for the task runner instance, which will
     * spawn and run input `TsundereTask`s in parallel, calls the named exported
     * standalone `parallel` function under the hood.
     */
    parallel = (tasks: TsundereTask[]) => {
        this.tasks.push(task(async () => 
            await parallel(tasks)))
        return this
    }
    /**
     * Add new task for the task runner instance, which will
     * spawn and run input `TsundereTask`s in sequence, calls the named exported
     * standalone `series` function under the hood.
     */
    series = (tasks: TsundereTask[]) => {
        this.tasks.push(task(async () => 
            await series(tasks)))
        return this
    }
    /**
     * Run registered tasks by the task runner instance in parallel
     */
    run = async () => await parallel(this.tasks)
}