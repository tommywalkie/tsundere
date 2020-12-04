// The benchmark engine
import benchmark from 'benchmark'

// Tsundere
import {series, parallel, task, TsundereRunner} from '../'

// Our challengers
import { SerialRunner, ParallelRunner } from 'serial'
import pSeries from 'p-series'
import pWaterfall from 'p-waterfall'
import { ReqQueue } from '@soncodi/reqqueue'
import { mapSeries, map } from 'async'
import Machinegun from 'machinegun'
import fastparallel from 'fastparallel'
import fastfall from 'fastfall'
import foreign from 'foreign'
import Bluebird from 'bluebird'
import savoy from 'savoy'
import execute from 'many-promises'
import oneByOne from 'one-by-one'
import Undertaker from 'undertaker'
import { Unqueue } from 'unqueue'

// Sample Fibonacci function
export const fib = (input: number) => {
    function __fib(nbr: number) {
        if(nbr < 2)
            return nbr
        return __fib(nbr - 1) + __fib(nbr - 2)
    }
    return __fib(input)
}