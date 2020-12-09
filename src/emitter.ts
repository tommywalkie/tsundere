export class TsundereEventEmitter {
    protected e: Record<string, any[]> = {}
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
     * Internal function used by `<class>.once`
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
}