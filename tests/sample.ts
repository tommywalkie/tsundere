import { test } from 'uvu'
import * as assert from 'uvu/assert'
import * as tsundere from '../src/'

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('describe', () => {
    assert.is(tsundere.describe('my-task', async () => {}).label, 'my-task')
    assert.is.not(tsundere.describe('my-task', async () => {}).label, 'something')
})

test.run()
