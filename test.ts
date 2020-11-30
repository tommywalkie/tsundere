import {TsundereTask, series, parallel} from '.'

const one = new TsundereTask(async () => {
	return new Promise(resolve => {
		console.log('A -- CALLED')
		setTimeout(() => {
			console.log('A -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const two = new TsundereTask(async () => {
	return new Promise(resolve => {
		console.log('B -- CALLED')
		setTimeout(() => {
			console.log('B -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const three = new TsundereTask(async () => {
	return new Promise(resolve => {
		console.log('C -- CALLED')
		setTimeout(() => {
			console.log('C -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const four = new TsundereTask(async () => {
	return new Promise(resolve => {
		console.log('D -- CALLED')
		setTimeout(() => {
			console.log('D -- RESOLVED')
			resolve(true)
		}, 2000)
	})
})
const five = new TsundereTask(async () => {
	return new Promise(resolve => {
		console.log('E -- CALLED')
		setTimeout(() => {
			console.log('E -- RESOLVED')
			resolve(true)
		}, 4000)
	})
})
;(async () => {
	const first = await series([one, two, three, four, five])
    console.log({first});
    const second = await parallel([one, two, three, four, five])
    console.log({second});
})()
