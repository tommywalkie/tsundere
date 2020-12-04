#!/usr/bin/env node

import { TsundereCli } from './core'
export type { TsundereCli }

new TsundereCli()
    .flag(['--version', '-v'])
    .flag(['--help', '-h'])
    .option(['--silent', '-s'])
    .run()
