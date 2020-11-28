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

export type TsundereHook = (props?: Record<string, any>) => Promise<any>

export interface TsundereTaskOptions {
	name?: string;
	instanciatedAt?: string;
	onStart?: TsundereHook;
	onEnd?: TsundereHook;
	onError?: (error: Error) => void;
}

const DEFAULT_ONERROR: (error: Error) => void = error => {
	throw error
}

export class TsundereTask {
	name?: string
	instanciatedAt: PathLike
	beginTimestamp!: [number, number]
	endTimestamp!: [number, number]
	onStart?: TsundereHook
	onEnd?: TsundereHook
	onError: (error: Error) => void
	callback: TsundereHook
	constructor(callback: TsundereHook = async () => {}, options: TsundereTaskOptions = {}) {
		try {
			throw new Error('This will help us retrieving the trace.')
		} catch (error) {
			this.instanciatedAt = options.instanciatedAt ??
                String((error as Error).stack?.replace(INSTANCIATED_PATTERN, '$<location>'))
		}

		this.onError = options.onError ?? DEFAULT_ONERROR
		this.callback = callback
	}

	run = async () => {
		this.beginTimestamp = process.hrtime()
		await this.callback().finally(() => {
			this.endTimestamp = process.hrtime(this.beginTimestamp)
		})
	}
}

export const series = async (tasks: TsundereTask[]) => {
	for await (const task of tasks) {
		await task.run()
	}
}

export const parallel = async (tasks: TsundereTask[]) =>
	Promise.all(tasks.map(async (task: TsundereTask) => task.run()))
