import {startService} from 'esbuild'
import type {Service} from 'esbuild'
import {dirname, extname, join, resolve} from 'path'
import {mkdir, readdir} from 'fs/promises'
import {createReadStream, createWriteStream, Dirent} from 'fs'
import type {ReadStream, WriteStream} from 'fs'

// @ts-expect-error
import {pipeline as __pipeline} from 'stream/promises'
const pipeline: (
	readable: ReadStream,
	transformer: (source: any) => AsyncGenerator<string, void>,
	writable: WriteStream
) => Promise<void> = __pipeline

const rootDir = dirname(__dirname)
const srcDir = resolve(`${rootDir}/src`)
const benchesDir = resolve(`${rootDir}/benches`)
const distDir = resolve(`${rootDir}/__dev__`)

const getFiles = async function* (currentDir: string): AsyncGenerator<string, void> {
	const dirents: Dirent[] = await readdir(currentDir, {withFileTypes: true})
	for (const dirent of dirents) {
		const path = resolve(currentDir, dirent.name)
		if (dirent.isDirectory()) {
			yield* getFiles(path)
		} else {
			yield path
		}
	}
}

const processFile = async (
    file: string,
    service: Service,
    srcDir: string,
    distDir: string,
    subDir: string = '/'
) => {
    const outFile = join(subDir, file.slice(srcDir.length))
    const extFile = extname(file)
    const outFilename = outFile.slice(0, Math.max(0, outFile.length - extFile.length))
    await mkdir(join(distDir, dirname(outFile)), {
        recursive: true
    }).catch(console.error)
    return await pipeline(
        createReadStream(resolve(file)),
        async function* (source) {
            source.setEncoding('utf8')
            let content = ''
            for await (const chunk of source) {
                content += chunk
            }

            const {code} = await service.transform(content, {
                loader: 'tsx',
                format: 'cjs',
                target: 'es2018'
            })
            yield code
        },
        createWriteStream(join(distDir, outFilename + '.js'))
    )
};

(async () => {
	const service: Service = await startService()
    for await (const file of getFiles('src')) {
		await processFile(file, service, srcDir, distDir)
    }
    for await (const file of getFiles('benches')) {
		await processFile(file, service, benchesDir, distDir, 'benches')
	}
	service.stop()
})()
