import { ParsedGenerator } from '@/parseGenerator'
import { colors } from 'swaglog'
import yt from 'youtill'

/** Check that the generator exists where it should be and download it if it isnt */
export const ensureGenerator = async (
	generator: ParsedGenerator,
	update?: boolean
): Promise<void> => {
	const exists = await yt.pathExists(generator.path)

	// if the generator already exists and no update is requested, we are done here
	if ((await yt.pathExists(generator.path)) && !update) return

	// if the generator is local but it doesnt exist throw an error
	if (generator.type === 'local' && !exists) {
		throw new Error(
			`Directory ${colors.underline(generator.path)} does not exist`
		)
	}

	// if the generator exists and we are updating, then update it in the Store
	if (exists && update) {
		// store.generators.update(generator)
		return
	}

	// if the generator still does not exist then add it to the store
	if (!exists) {
		// store.generators.add(generator)
	}
}
