import { TsundereEventEmitter } from './emitter'
import { startTimer, stopTimer } from './timer'

/**
 * Asynchrounous by default function with unsized props `K`,
 * returning a `T` typed value from a promise.
 */
export type TsundereCallback<T = any, K = Record<string, any>> = (props?: K) => Promise<T>

/**
 * Task completion status report
 */
export type TsundereTaskReport<T = any> = {
    label: string | undefined
    /**
     * Task callback returned value, or sub-tasks report array (mostly relevant for tasks
     * instanciated via `<TsundereRunner>.parallel` or `<TsundereRunner>.series`).
     */
    result: T | TsundereTaskReport[]
    /**
     * Task duration in milliseconds
     */
    duration: number
    list?: () => Array<any>
}

/**
 * Nameless Tsundere compatible task object, which emits events
 * (`start`, `end`, `error`) you can subscribe to, using browser-compatible
 * event subscribers `<TsundereTask>.on('<event>', callback)`
 * or `<TsundereTask>.once('<event>', callback)`
 * 
 * The `T` generic type (defaults to `any`) defines the expected returned
 * value type from the task callback promise.
 */
export class TsundereTask<T = any> extends TsundereEventEmitter {
    label: string | undefined
    /**
     * Hook function to be run by the task.
     */
    callback: TsundereCallback
	constructor(callback: TsundereCallback<T>) {
        super()
        this.callback = callback
    }
    /**
     * Runs the task and returns a task report with calculated duration and
     * sub-tasks reports, if exists.
     */
	public run = async (props?: Record<string, any>): Promise<TsundereTaskReport<T>> => {
        const begin: [number, number] = startTimer()
        this.emit('start')
        return await this.callback(props).then((result: any) => {
            const report = {
                label: this.label,
                result,
                duration: stopTimer(begin),
            }
            this.emit('end', { report })
            return report
        }).catch((reason: any) => {
            this.emit('error', reason)
            throw new Error(`Error encountered : ${reason}`)
        })
	}
}

/**
 * Shortcut method for creating a nameless `TsundereTask` instance
 */
export function task<T = any>(callback: TsundereCallback<T>): TsundereTask<T> {
    return new TsundereTask(callback)
}

/**
 * Label a `TsundereTask`-based task
 */
export function describe<T = any>(name: string, callback: TsundereCallback<T>) {
    const job = task(callback)
    job.label = name
    return job
}