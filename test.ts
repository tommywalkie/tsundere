import { TsundereRunner, task } from './'

const tsundere = new TsundereRunner()

const one = task(async () => {
	return new Promise(resolve => {
		console.log('A -- CALLED')
		setTimeout(() => {
			console.log('A -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const two = task(async () => {
	return new Promise(resolve => {
		console.log('B -- CALLED')
		setTimeout(() => {
			console.log('B -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const three = task(async () => {
	return new Promise(resolve => {
		console.log('C -- CALLED')
		setTimeout(() => {
			console.log('C -- RESOLVED')
			resolve(true)
		}, 1000)
	})
})
const four = task(async () => {
	return new Promise(resolve => {
		console.log('D -- CALLED')
		setTimeout(() => {
			console.log('D -- RESOLVED')
			resolve(true)
		}, 2000)
	})
})
const five = task(async () => {
	return new Promise(resolve => {
		console.log('E -- CALLED')
		setTimeout(() => {
			console.log('E -- RESOLVED')
			resolve(true)
		}, 4000)
	})
})
;(async () => {
    tsundere.series([one, two])
    tsundere.task('SECOND', async () => {
        const _ = async () => 1 + 1
        return await _()
    })
    tsundere.parallel([four, four])
    tsundere.series([one])
    one.once('start', async () => {
        console.log('one started once.')
    })
    one.once('end', async () => {
        console.log('one ended once.')
    })
    four.on('start', async () => {
        console.log('four started.')
    })
    four.on('end', async () => {
        console.log('four ended.')
    })
    const report = await tsundere.run()
    console.log({report})
    console.log(report[0].result)
    console.log(report[1].result)
    console.log(report[2].result)
    console.log(report[3].result)
})()
