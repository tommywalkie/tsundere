type FixedSizeArray<N extends number, T> = N extends 0 ? never[] : {
    0: T;
    length: N;
} & ReadonlyArray<T>

/**
 * Type that expect an array with 1 or 2 `T` typed values
 */
export type SinglePairArray<T> = FixedSizeArray<1, T> | FixedSizeArray<2, T>

export type TsundereCliOption = {
    labels: SinglePairArray<string>
    description: string
    defaultValue: string | boolean
}

export type TsundereCliExpectedValue = {
    label: string
    description: string
    optional: boolean
}

export type TsundereCliCommand = {
    aliases: Array<string>
    description: string
    expectedValues: Array<TsundereCliExpectedValue>
}

export type TsundereCliFlag = Omit<TsundereCliOption, "defaultValue"> & {
    defaultValue: boolean
}

export type TsundereCliValue = boolean | string

export const FLAG_PATTERN: RegExp = /^\-\-?(?<flag>[a-zA-Z]+)$/
export const OPTION_PATTERN: RegExp = /^\-\-?(?<flag>[a-zA-Z]+)[\= ](?<value>[a-zA-Z0-9\\\/\:\.]+)$/

export const sanitizeValue = (value: TsundereCliValue) =>
    value === 'true' ? true : value === 'false' ? false : value

export type TsundereParsedInputs = {
    commands: Array<TsundereCliValue>
    options: Record<string, TsundereCliValue>
    values: Array<TsundereCliValue>
}

/**
 * This is a minimalist CLI framework mostly designed for Tsundere.
 * It still can be used for very simple use cases, though. 
 */
export class TsundereCli {
    commands: Array<TsundereCliCommand> = []
    flags: Record<string, TsundereCliFlag>[] = []
    options: Record<string, TsundereCliOption>[] = []
    flag = (
        labels: SinglePairArray<string>,
        description: string = '',
        defaultValue: boolean = false
    ): this => {
        labels.forEach((label: string) =>
            (this.flags as any)[label] =
                {labels, description, defaultValue} as TsundereCliFlag)
        return this
    }
    option = (
        labels: SinglePairArray<string>,
        description: string = '',
        defaultValue: TsundereCliValue = false
    ): this => {
        labels.forEach((label: string) =>
            (this.options as any)[label] =
                {labels, description, defaultValue} as TsundereCliOption)
        return this
    }
    command = (
        aliases: Array<string>,
        description: string = '',
        expectedValues: Array<TsundereCliExpectedValue> = []
    ): this => {
        aliases.forEach((alias: string) =>
            (this.commands as any)[alias] =
                {aliases, description, expectedValues} as TsundereCliCommand)
        return this
    }
    parse = (args: string[]): TsundereParsedInputs => {
        let options: Record<string, TsundereCliValue> = {}
        let values: string[] = []
        let commands: string[] = []
        let __expect_command: boolean = true
        const __labels: string[] = []
            .concat(...Object.keys(this.flags).map(key => (this.flags as any)[key].labels))
            .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], [])
        const __commands: string[] = []
            .concat(...Object.keys(this.commands).map(key => (this.flags as any)[key].aliases))
            .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], [])
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
            else if (index > 0 && OPTION_PATTERN.test(`${previous} ${arg}`) && !__labels.includes(previous)) {
                options[previous.replace(FLAG_PATTERN, '$<flag>')] = sanitizeValue(arg)
                __expect_command = false
            }
            else if (__expect_command && __commands.includes(arg)) {
                commands.push(arg)
            }
            else values.push(arg)
        })
        return {commands, options, values}
    }
    run = () => {
        console.log(this.parse([...process.argv.filter((_, index) => index > 1)]))
    }
}