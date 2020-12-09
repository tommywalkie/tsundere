import { TsundereEventEmitter } from './emitter'

export interface TsundereAction {
    type: string
    payload: Record<string, any>
}

export class TsundereStore extends TsundereEventEmitter {
    private __state: Record<string, any> = {}
    private __commits: Map<Date, Record<string, any>> = new Map()
    public getState = () => this.__state
    private commit(state: Record<string, any>) {
        this.__commits.set(new Date(), state)
        return this.__state = state
    }
    public dispatch(action: TsundereAction) {
        const __new = { ...this.getState(), ...action.payload }
        this.emit(action.type, __new)
        return this.commit(__new)
    }
}