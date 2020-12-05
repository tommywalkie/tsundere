import { join, dirname } from 'path'
import { promises } from 'fs'
import { TsundereCallback } from '../'
import { reporter } from './docopt'

type FixedSizeArray<N extends number, T> = N extends 0 ? never[] : {
    0: T;
    length: N;
} & ReadonlyArray<T>

/**
 * Type that expect an array with 1 or 2 `T` typed values
 */
export type SinglePairArray<T> = FixedSizeArray<1, T> | FixedSizeArray<2, T>

export type TsundereOption = {
    aliases: SinglePairArray<string>
    description: string
    defaultValue: string | boolean
}

export type TsundereCommand = {
    alias: string
    description: string
    callback: TsundereCallback
}

export type TsundereFlag = Omit<TsundereOption, "defaultValue"> & {
    defaultValue: boolean
}

export type TsundereCliValue = boolean | string | number

export const FLAG_PATTERN: RegExp = /^\-\-?(?<flag>[a-zA-Z]+)$/
export const OPTION_PATTERN: RegExp = /^\-\-?(?<flag>[a-zA-Z]+)[\= ](?<value>[\w\\\/\:\.\,\@]+)$/

export const sanitizeValue = (value: TsundereCliValue) =>
    value === 'true' ? true : value === 'false' ? false : value

export type TsundereInputContext = {
    commands: Array<TsundereCliValue>
    options: Record<string, TsundereCliValue>
    values: Array<TsundereCliValue>
}

export function uniques(a: Array<string>, b: string) {
    return a.includes(b) ? a : [...a, b]
}

function __aliases(collection: Record<string, any>): Array<string> {
    return [].concat(...Object.keys(collection)
        .map(key => (collection as any)[key].aliases))
        .reduce(uniques, [])
}

/**
 * This is a minimalist CLI framework mostly designed for Tsundere.
 * It still can be used for very simple use cases, though. 
 */
export class TsundereCli {
    commands: Array<TsundereCommand> = []
    flags: Record<string, TsundereFlag>[] = []
    options: Record<string, TsundereOption>[] = []
    private _fallback: TsundereCallback = async() => {}
    private _manifest: Record<string, string> = {}
    flag(
        aliases: SinglePairArray<string>,
        description: string = '',
        defaultValue: boolean = false
    ) {
        aliases.forEach((label: string) =>
            (this.flags as any)[label] =
                {aliases, description, defaultValue} as TsundereFlag)
        return this
    }
    option(
        aliases: SinglePairArray<string>,
        description: string = '',
        defaultValue: TsundereCliValue = false
    ) {
        aliases.forEach((label: string) =>
            (this.options as any)[label] =
                {aliases, description, defaultValue} as TsundereOption)
        return this
    }
    command(
        alias: string,
        description: string = '',
        callback: TsundereCallback
    ) {
        (this.commands as any)[alias] =
            {alias, description, callback} as TsundereCommand
        return this
    }
    private async help(parsed: TsundereInputContext) {
        console.log(reporter(this._manifest, this.commands, this.options, this.flags))
    }
    parse = (
        args: string[] = [...process.argv.filter((_, index) => index > 1)]
    ): TsundereInputContext => {
        let options: Record<string, TsundereCliValue> = {}
        let values: string[] = []
        let commands: string[] = []
        let __expect_command: boolean = true
        args.forEach((arg, index) => {
            if (index > 1) __expect_command = false
            const previous = index > 0 ? args[index-1] : ''
            if (FLAG_PATTERN.test(arg)) {
                options[arg.replace(FLAG_PATTERN, '$<flag>')] = true
                __expect_command = false
            }
            else if (OPTION_PATTERN.test(arg)) {
                options[arg.replace(OPTION_PATTERN, '$<flag>')] = 
                    sanitizeValue(arg.replace(OPTION_PATTERN, '$<value>'))
                __expect_command = false
            }
            else if (
                index > 0
                && OPTION_PATTERN.test(`${previous} ${arg}`)
                && !__aliases(this.flags).includes(previous)
            ) {
                options[previous.replace(FLAG_PATTERN, '$<flag>')] = sanitizeValue(arg)
                __expect_command = false
            }
            else if (__expect_command && Object.keys(this.commands).includes(arg))
                commands.push(arg)
            else {
                __expect_command = false
                values.push(arg)
            }
        })
        return {commands, options, values}
    }
    public fallback(callback: TsundereCallback) {
        this._fallback = callback
        return this
    }
    run = async () => {
        // TODO: use Rollup and parse the relevant manifest data directly
        this._manifest = await promises
            .readFile(join(dirname(__dirname), 'package.json'), 'utf8')
            .then(data => JSON.parse(data))
        const {commands, options, values} = this.parse()
        console.log({commands, options, values})
        if (commands.length) {

        }
        else if (Object.keys(options).includes('help') || Object.keys(options).includes('h'))
            await this.help({commands, options, values})
        else
            this._fallback({ version: this._manifest.version })
    }
}