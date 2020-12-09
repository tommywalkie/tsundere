> ## 🛠 Status: In Development
> Tsundere is currently under heavy development. Feedback is always welcome, but be careful with
using it in production. API is not ready yet and can receive large changes.

# Tsundere

[![npm](https://img.shields.io/npm/v/tsundere)](https://www.npmjs.com/package/tsundere) [![minified size](https://badgen.net/bundlephobia/min/tsundere)](https://bundlephobia.com/result?p=tsundere@latest) ![dependency count](https://badgen.net/bundlephobia/dependency-count/tsundere) [![Known Vulnerabilities](https://snyk.io/test/npm/tsundere/latest/badge.svg)](https://snyk.io/test/npm/tsundere/latest)

Tsundere is a modern, lightweight and type-safe task runner for the stubborn ones.

## Install

Install Tsundere for Node, using NPM or Yarn.

```bash
npm install --save-dev tsundere
```

Tsundere can also be used inside a browser, as an ES Module.

```html
<script type="module">
    import * as tsundere from 'https://esm.run/tsundere'           // jsDelivr
    import * as tsundere from 'https://cdn.skypack.dev/tsundere'   // Skypack
    import * as tsundere from 'https://unpkg.com/tsundere?module'  // Unpkg
</script>
```

#### Browser compatibility

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| IE10+ / Edge 12                                              | Firefox 15                                                   | Chrome 20                                                    | Safari 8                                                     | iOS Safari 9                                                 | Opera 15                                                     |

Tsundere is able to support up to Internet Explorer 10 and any browser with [High Resolution Time API](https://caniuse.com/high-resolution-time), using a few polyfills. 

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6%2CReflect%2CSymbol%2CObject.defineProperty"></script>
<script src="https://unpkg.com/tsundere/dist/legacy"></script>
```

## Usage

> The following section will soon provide the Tsundere CLI usage guide, once it's ready.

<img src="https://raw.githubusercontent.com/tommywalkie/tsundere/main/.github/assets/placeholder.png">

## API

A task is defined by a `callback` function. Nameless tasks an be constructed via `new TsundereTask(callback)` or `task(callback)`. A provided Jest-inspired `describe` function can help you label your tasks.

```js
import { describe } from 'tsundere'
const job = describe('my-task', async () => await somePromiseWhichReturn(true))
```

You can subscribe to task events, using `<TsundereTask>.on` or `<TsundereTask>.once`.

```javascript
job.once('start', () => console.log('it started.'))
job.once('end', () => console.log('it ended.'))
job.on('error', (e) => console.log(`Oops! Something went wrong..\n${e}`))
```

Using `<TsundereTask>.run` method, the task will run and return a report, including relevant data as well as the duration in milliseconds.

```javascript
job.run().then(data => { console.log(data); })
// {
//   "label": "my-task",
//   "result": true,
//   "duration": 1.4819
// }
```

Tasks may be run concurrently, using `parallel`.

```js
import { parallel } from 'tsundere'
const suite = parallel([promiseA, promiseB, promiseC])
```

Or in sequence, using `series`.

```js
import { series } from 'tsundere'
const suite = series([promiseA, promiseB, promiseC])
```

You can also set up a `TsundereRunner` task runner to run tasks inside a context and chain tasks and reduce boilerplate code related to event subscriptions. Registered tasks will be run in parallel when using `<TsundereRunner>.run`.

```typescript
import { TsundereRunner, task } from 'tsundere'
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function log(char) {
    console.log(char)
    return () => char
}
const tsundere: TsundereRunner = new TsundereRunner() 
tsundere.task(async () => await timeout(300).then(log('A')))
tsundere.parallel([
  task(async () => await timeout(650).then(log('B'))),
  task(async () => await timeout(800).then(log('C')))
])
tsundere.series([
  task(async () => await timeout(700).then(log('D'))),
  task(async () => await timeout(500).then(log('E'))),
  task(async () => await timeout(200).then(log('F')))
])
tsundere.run().then(data => { console.log(data); })
```

## Contributing

```bash
npm install     # Install dependencies
npm run build   # Transpile, generate typings, bundle for production
npm run test    # Run test(s)
```

## License

Tsundere is licensed under [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

© Copyright 2020 Tom Bazarnik.

