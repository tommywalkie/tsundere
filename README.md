# Task runnerTsundere

[![npm](https://img.shields.io/npm/v/tsundere)](https://www.npmjs.com/package/tsundere) [![install size](https://packagephobia.com/badge?p=tsundere@latest)](https://packagephobia.com/result?p=tsundere@latest) ![dependency count](https://badgen.net/bundlephobia/dependency-count/tsundere)

Tsundere is a modern, lightweight and type-safe task runner for the stubborn ones.

## Install

```bash
npm install tsundere
```

Tsundere is Node/browser compatible and also provides minified outputs.

```html
<script src="https://unpkg.com/tsundere/dist/index.min.js"></script>
```

## Usage

TODO

## API

A task is defined by a `callback` function and subscribable node/browser events (`start`; `end`, `error` for now). Can be constructed via `new TsundereTask(callback: async Function)`.

```js
import { TsundereTask } from 'tsundere'
const job = new TsundereTask(async () => 1 + 1)
```

You can conditionally subscribe to events, using `<TsundereTask>.on` or `<TsundereTask>.once`.

```javascript
job.once('start', () => console.log('it started.'))
job.once('end', () => console.log('it ended.'))
job.on('error', (e) => console.log(`Something went wrong..\n${e}`))
```

Using shortcut methods like `namedTask`, you can quickly set up a labelled task.

```js
import { namedTask } from 'tsundere'
const job = namedTask('my-job', async () => 1 + 1)
```

Running a task returns a report, including the task label (`symbol()` by default), the returned value and the duration in milliseconds.

```json
{
   __id: 'my-job',
   result: 2,
   duration: 1.4819
}
```

Tsundere tasks may be run concurrently, using `parallel`.

```js
import { parallel } from 'tsundere'
// Setup some tasks then...
const run = parallel([taskA, taskB, taskC])
;(async() => await run())()
```

Or in sequence, using `series`.

```js
import { series } from 'tsundere'
// Setup some tasks then...
const run = series([taskA, taskB])
;(async() => await run())()
```

You can also set up a `TsundereRunner` task runner to run tasks inside a context and chain tasks or groups of tasks. In the future, we may provide more features like file crawling (NodeJS only), context state, task runner events.

```js
import { TsundereRunner } from 'tsundere'
const tsundere = new TsundereRunner() 
tsundere.task('my-task', async () => {
    setTimeout(() => { console.log('A') }, 4000)
})
tsundere.series([
  task(async () => { setTimeout(() => { console.log('B') }, 1000) }),
  task(async () => { setTimeout(() => { console.log('C') }, 3500) })
])
tsundere.parallel([
  task(async () => { setTimeout(() => { console.log('D') }, 2000) }),
  task(async () => { setTimeout(() => { console.log('E') }, 2500) })
])
```

Upon using `<TsundereRunner>.run`, registered tasks will be run in parallel.

```js
;(async() => await tsundere.run())()
// => 'B' (~1s)
// => 'D' (~2s)
// => 'E' (~2.5s)
// => 'A' (~4s)
// => 'C' (~4.5s)
```

## Roadmap

- [x] Tasks
  - [x] Node/browser compatible events
  - [x] Node/browser compatible timers
- [x] Run tasks in parallel
- [x] Run tasks in sequence
- [ ] Task runner
  - [x] Register and run tasks
  - [ ] Runner events
  - [ ] Runner state
  - [ ] Plugins
- [ ] File crawling plugin
  - [x] Retrieve files in directory recursively
  - [x] Retrieve folders in directory recursively
  - [ ] Glob support
- [ ] CLI
- [ ] Benchmarks

## Contributing

```bash
npm install     # Install dependencies
npm run build   # Transpile, generate typings, bundle for production
npm run test    # Run test(s)
```

## License

Tsundere is licensed under [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

© Copyright 2020 Tom Bazarnik.

