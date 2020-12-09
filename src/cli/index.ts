#!/usr/bin/env node

import { TsundereCli } from './core'

new TsundereCli()
    .flag(['--version', '-v'], 'Get Tsundere CLI version')
    .flag(['--help', '-h'], 'Display help')
    .option(['--maxSize'], 'Maximum output file size', 5)
    .command('run', 'Run commands', async () => {})
    .command('run2', 'Run commands', async () => {})
    .command('run33', 'Run commands', async () => {})
    .command('run4848', 'Run commands', async () => {})
    .fallback(async (props: any) => { console.log(props) })
    .run()
