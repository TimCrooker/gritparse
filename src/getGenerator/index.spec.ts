
import { defaultGeneratorFile } from '@/defaultGenerator'
import { parseGenerator } from '@/parseGenerator'
import path from 'path'
import { getGenerator, loadGeneratorGrit } from '.'

describe('Name of the group', () => {
	it('should load npm generator versioned instance', async () => {
		const parsedGenerator = parseGenerator(path.resolve(__dirname, 'fixtures'))

		const generator = await loadGeneratorGrit(parsedGenerator)

		const grit = new generator({
			config: defaultGeneratorFile,
			generator: parsedGenerator,
			mock: true,
		})

		expect(grit).toBeDefined()

		await grit.run()

		const output = await grit.readOutputFile('foo.txt')

		expect(output).toBe('foo')
	})

	it('should load instantiated generator', async () => {
		const grit = await getGenerator({
			generator: path.resolve(__dirname, 'fixtures'),
			mock: true,
		})

		expect(grit).toBeDefined()

		await grit.run()

		const output = await grit.readOutputFile('foo.txt')

		expect(output).toBe('foo')
	})
})
