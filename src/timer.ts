/**
 * Convert a NodeJS high-resolution real time generated via `process.hrtime()` to milliseconds.
 */
const hrToMs = (hrtime: [number, number]): number => 
    (hrtime[0] * 1e9 + hrtime[1]) / 1e6

/**
 * Starts a timer, node and browser compatible.
 */
let startTimer: () => [number, number]

/**
 * Compare timers, node and browser compatible.
 */
let stopTimer: (previous: [number, number]) => number

if ([typeof window, typeof document].includes('undefined')) {
   startTimer = () => process.hrtime()
   stopTimer = (previous: [number, number]) => hrToMs(process.hrtime(previous))
}
else {
   startTimer = () => [0, performance.now()]
   stopTimer = (previous: [number, number]) => performance.now() - previous[1]
}

export { startTimer, stopTimer }