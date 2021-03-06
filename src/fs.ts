import {resolve} from 'path'
import {promises} from 'fs'
import type {Dirent} from 'fs'

const {readdir} = promises
/**
 * Retrieves files recursively from a given path
 */
export const getFiles = async function* (currentDir: string): AsyncGenerator<string, void> {
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

/**
 * Retrieves directories recursively from a given path
 */
export const getDirectories = async function* (currentDir: string): AsyncGenerator<string, void> {
	const dirents = await readdir(currentDir, {withFileTypes: true})
	for (const dirent of dirents) {
		const path = resolve(currentDir, dirent.name)
		if (dirent.isDirectory()) {
			yield* getDirectories(path)
			yield path
		}
	}
}
