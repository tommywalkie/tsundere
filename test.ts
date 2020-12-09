import { TsundereRunner, task, parallel, describe } from './'

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const tsundere = new TsundereRunner()

function log(char: string) {
    console.log(char)
    return () => char
}

tsundere.task(async () => await timeout(300).then(log('A')))
tsundere.describeParallel('parallel-task', [
    describe('task-B', async () => await timeout(650).then(log('B'))),
    describe('task-C', async () => await timeout(800).then(log('C')))
])
tsundere.series([
  task(async () => await timeout(700).then(log('D'))),
  describe('task-E', async () => await timeout(500).then(log('E'))),
  task(async () => await timeout(200).then(log('F')))
])
tsundere.describe('task-G', async () => await timeout(750).then(log('G')))

;(async() => {
  await tsundere.run().then((data: any) => {
    console.log(data)
  })
})()
