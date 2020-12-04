/**
 * Convert a NodeJS high-resolution real time generated via `process.hrtime()` to milliseconds.
 */
const hrToMs = (hrtime: [number, number]): number => 
    (hrtime[0] * 1e9 + hrtime[1]) / 1e6

/**
 * Starts a timer, node and browser compatible.
 */
let startTimer: () => [number, number] | number

/**
 * Compare timers, node and browser compatible.
 */
let stopTimer: (previous: any) => number

if ([typeof window, typeof document].includes('undefined')) {
   startTimer = () => process.hrtime()
   stopTimer = (previous: [number, number]) => hrToMs(process.hrtime(previous))
}
else {
   startTimer = () => performance.now()
   stopTimer = (previous: number) => performance.now() - previous
}

export { startTimer, stopTimer }