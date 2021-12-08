import path from 'path'
import JoyCon from 'joycon'
import pa from 'path'
import { GeneratorConfig, Grit, GritOptions } from 'grit-cli'
import { logger } from 'swaglog'
import { ensureGenerator } from '@/ensureGenerator'
import {
	ParsedGenerator,
	parseGenerator,
	NpmGenerator,
	RepoGenerator,
} from '@/parseGenerator'
import { defaultGeneratorFile } from '@/defaultGenerator'
import { globalRequire, pathExists } from 'youtill'

const joycon = new JoyCon({
	files: ['generator.js', 'generator.ts', 'generator.json'],
})

/** load the generator config file */
export const loadGeneratorConfig = async (
	cwd: string
): Promise<{ path?: string; data?: GeneratorConfig }> => {
	logger.debug('loading generator from path:', cwd)
	const { path } = await joycon.load({
		cwd,
		stopDir: pa.dirname(cwd),
	})
	const data = path ? await globalRequire(path) : undefined

	return { path, data }
}

/** Check generator has config file */
export const hasGeneratorConfig = (cwd: string): boolean => {
	return Boolean(
		joycon.resolve({
			cwd,
			stopDir: pa.dirname(cwd),
		})
	)
}

/**
 * Load local version of grit for npm packages and local generators
 * if none is found, load the newest version one
 */
export const loadGeneratorGrit = async (
	generator: ParsedGenerator
): Promise<typeof Grit> => {
	//load the generators installed version of grit generator
	let gritPath = path.resolve(generator.path, '../grit-cli/dist/index.js')

	if (generator.type === 'local') {
		gritPath = path.resolve(
			generator.path,
			'node_modules/grit-cli/dist/index.js'
		)
	}

	// if gritPath is valid then import it and return the grit object
	if (await pathExists(gritPath)) {
		const { Grit } = await import(gritPath)
		return Grit
	}

	return Grit
}

interface GetGeneratorOptions
	extends Omit<GritOptions, 'parsedGenerator' | 'config'> {
	generator: ParsedGenerator | string
}

/**
 * Get actual generator to run and its config
 *
 * Download it if not yet cached
 */
export const getGenerator = async (
	opts: GetGeneratorOptions,
	forceNewest = false
): Promise<Grit> => {
	let parsedGenerator: ParsedGenerator
	// use directly passed parsed generator or parse generator string
	if (typeof opts.generator === 'string') {
		parsedGenerator = parseGenerator(opts.generator as string)
	} else {
		parsedGenerator = opts.generator as NpmGenerator | RepoGenerator
	}

	await ensureGenerator(parsedGenerator, opts.update)

	// load actual generator from generator path
	const loadedConfig = await loadGeneratorConfig(parsedGenerator.path)
	const config: GeneratorConfig =
		loadedConfig.path && loadedConfig.data
			? loadedConfig.data
			: defaultGeneratorFile

	// load the version of grit from the generator or the newest if it doesn't exist or forceNewest is true
	const Gen = forceNewest ? Grit : await loadGeneratorGrit(parsedGenerator)

	return new Gen({ ...opts, config: config, generator: parsedGenerator })
}
