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
    __id: string | Symbol
    /**
     * Task callback returned value, or sub-tasks report array (mostly relevant for tasks
     * instanciated via `<TsundereRunner>.parallel` or `<TsundereRunner>.series`).
     */
    result: T | TsundereTaskReport[]
    /**
     * Task duration in milliseconds
     */
    duration: number
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
export class TsundereTask<T = any> {
    __id: string | Symbol = Symbol(undefined)
    /**
     * Hook function to be run by the task.
     */
    callback: TsundereCallback
    private e: Record<string, any[]> = {}
	constructor(callback: TsundereCallback<T>) {
        this.callback = callback
    }
    /**
     * Chainable function to add new event listener,
     * available events are `start`, `end`, `error`. COnsider using `once`
     */
    on = (event: string, fn: Function, ctx?: any) => {
        (this.e[event] || (this.e[event] = [])).push({ fn, ctx })
        return this
    }
    /**
     * Chainable function to add new event listener,
     * which will happen only once then gets deleted from the task instance.
     */
    once = (event: string, fn: Function, ctx?: any): any => {
        let self = this;
        const listener = function () {
          self.off(event, listener)
          fn.apply(ctx, arguments)
        }
        listener._ = fn
        return this.on(event, listener, ctx)
    }
    /**
     * Internal function used by `<TsundereBaseTask>.once`
     * in order to stop all listeners from a single event.
     * @private
     */
    private off = (event: string, callback: Function) => {
        let evts = this.e[event]
        let liveEvents = []
        if (evts && callback) {
            for (let i = 0, len = this.e[event].length; i < len; i++)
                if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                    liveEvents.push(evts[i])
        }
        (liveEvents.length)
            ? this.e[event] = liveEvents
            : delete this.e[event]
        return this
    }
    /**
     * Emit new node-browser-compatible event.
     */
    emit = (event: string, ...args: any) => {
        let evtArr = (this.e[event] || []).slice()
        let len = evtArr.length
        for (let i = 0; i < len; i++)
            evtArr[i].fn.apply(evtArr[i].ctx, [...args])
    }
    /**
     * Runs the task and returns a task report with calculated duration and
     * sub-tasks reports, if exists.
     */
	public run = async (props?: Record<string, any>): Promise<TsundereTaskReport<T>> => {
        const begin: number | [number, number] = startTimer()
        this.emit('start')
        return await this.callback(props).then((result: any) => {
            this.emit('end')
            return {
                __id: this.__id,
                result,
                duration: stopTimer(begin)
            }
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
 * Shortcut method for creating a named `TsundereTask` instance
 */
export function namedTask<T = any>(name: string | Symbol, callback: TsundereCallback<T>): TsundereTask<T> {
    const t = new TsundereTask(callback)
    t.__id = name
    return t
}