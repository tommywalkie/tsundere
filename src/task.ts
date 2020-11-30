import type {PathLike} from 'fs'

/**
 * This regex allows to retrieve where the TsundereTask got instanciated,
 * using an error trace as input. https://regex101.com/r/dMenCi/1
 *
 * @example
 * const trace = `Error
 *  at new TsundereTask (C:/foo/node_modules/tsundere/dist/index.js:17:13)
 *  at Object.<anonymous> (C:/foo/src/index.js:23:11)
 *  at Module._compile (node:internal/modules/cjs/loader:1083:30)
 *  [...]`.replace(INSTANCIATED_PATTERN, '$<location>') // "C:/foo/src/index.js:23:11"
 */
const INSTANCIATED_PATTERN =
    /er{2}or.*\r?\n[ \t]+at (?:new )?[\w$.<>\\/:]+( \([\w$.\\/:]+\))?\r?\n+[ \t]+at (?:[\w$.<>]+ (?:\[[^\]]+] )?\()?(?<location>[\w$.\\/:]+)\)?\r?\n?(?:.*[\r\n]?)+/gim

/**
 * Simple helper type, defining an asynchrounous function with unsized props.
 */
export type TsundereHook = (props?: Record<string, any>) => Promise<any>

/**
 * Expected task option fields, used as `TsundereTask` class constructor parameters
 */
export interface TsundereTaskOptions {
    /**
     * Task label
     */
    name?: string;
    /**
     * Source code location where the `TsundereTask` got instanciated
     */
    instanciatedAt?: string;
    /**
     * Hook function to be run just when the task starts running
     */
    onStart?: TsundereHook;
    /**
     * Hook function to be run just when the task ends running
     */
    onEnd?: TsundereHook;
    /**
     * Hook function to be run when the task runs into an error
     */
	onError?: (error: Error) => void;
}

/**
 * Task completion status report
 */
export interface TsundereTaskReport {
    /**
     * Task result
     */
    result: boolean
    /**
     * Task duration in milliseconds
     */
    duration: number
}

/**
 * Convert a NodeJS high-resolution real time generated via `process.hrtime()` to milliseconds.
 */
const hrToMs = (hrtime: [number, number]): number => 
    (hrtime[0]* 1000000000 + hrtime[1]) / 1000000

/**
 * Tsundere compatible task object instance
 */
export class TsundereTask {
    /**
     * Task label
     */
    label?: string
    /**
     * Source code location where the `TsundereTask` got instanciated
     */
    instanciatedAt: PathLike
    /**
     * Hook function to be run just when the task starts running
     */
    onStart?: TsundereHook
    /**
     * Hook function to be run just when the task ends running
     */
    onEnd?: TsundereHook
    /**
     * Hook function to be run when the task runs into an error
     */
	onError: (error: Error) => void = error => {
        throw error
    }
    /**
     * Hook function to be run by the task, after `onStart` and before `onEnd`.
     */
	callback: TsundereHook = async () => {}
	constructor(callback: TsundereHook = async () => {}, options: TsundereTaskOptions = {}) {
		try {
			throw new Error('This will help us retrieving the trace.')
		} catch (error) {
            if (options.instanciatedAt)
                this.instanciatedAt = options.instanciatedAt
            else
                this.instanciatedAt = String(error.stack).replace(INSTANCIATED_PATTERN, '$<location>')
		}
        if (options.onError) this.onError = options.onError
        if (options.onStart) this.onStart = options.onStart
        if (options.onEnd) this.onEnd = options.onEnd
		if (callback) this.callback = callback
	}
    /**
     * Runs the task and returns a task report with calculated duration.
     */
	run = async (props?: Record<string, any>): Promise<TsundereTaskReport> => {
        const beginTimestamp: [number, number] = process.hrtime()
        if (this.onStart) this.onStart()
        return await this.callback(props).then((result: any) => {
            if (this.onEnd) this.onEnd()
            return {
                result,
                duration: hrToMs(process.hrtime(beginTimestamp))
            } as TsundereTaskReport
        }).catch((reason: any) => {
            throw new Error(`Error encountered : ${reason}`)
        })
	}
}

/**
 * Run tasks in sequence
 */
export const series = async (tasks: TsundereTask[]): Promise<TsundereTaskReport[]> => {
    let state: any[] = []
    return await tasks.reduce(async (previousPromise: any, nextPromise: TsundereTask) => {
        return await previousPromise.then(async (result: any) => {
            state.push(result)
            return await nextPromise.run()
        })
    }, Promise.resolve()).then(() => state.filter(el => el !== undefined))
}

/**
 * Run tasks in parallel
 */
export const parallel = async (tasks: TsundereTask[]): Promise<TsundereTaskReport[]> =>
	Promise.all(tasks.map(async (task: TsundereTask) => task.run()))
