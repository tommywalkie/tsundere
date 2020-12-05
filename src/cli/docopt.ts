import { TsundereCommand, TsundereFlag, TsundereOption } from './core'

export function reporter(
    manifest: Record<string, any>,
    commands: TsundereCommand[],
    options: Record<string, TsundereOption>[],
    flags: Record<string, TsundereFlag>[]
) {
    const cs = Object.assign({ ...commands })
    const maxCmdLen = Math.max(...(Object.keys(Object.assign({ ...commands }))
        .map(el => cs[el].alias.length) as number[]))
    const maxOptLen = Math.max(...(Object.keys({ ...options, ...flags }).map(c => 
        (Object.assign({}, { ...options, ...flags }) as any)[c].aliases.join(', ').length) as number[]))
    return `Tsundere v${manifest.version}

  Usage:
    ${Object.keys({ ...commands }).map(
        c => {
            const cp = cs[c]
            return `tsundere ${cp.alias + Array.from(Array(maxCmdLen - cp.alias.length).keys())
                .map(_ => ' ').join('')}  ${cp.description}`
        }).join('\n    ')}

  Options:
    ${Array.from(new Set(Object.keys({ ...options, ...flags }).map(c => {
        const fo: TsundereOption | TsundereFlag = (Object.assign({}, { ...options, ...flags }) as any)[c]
        const __flags = fo.aliases.join(', ')
        return `${__flags + Array.from(Array(maxOptLen - __flags.length).keys())
            .map(_ => ' ').join('')
        }  ${fo.description} ${fo.defaultValue ? `[default=${fo.defaultValue}]` : ''}`
    }))).join('\n    ')}`
}