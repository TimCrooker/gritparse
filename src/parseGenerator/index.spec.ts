import {
	getGeneratorPrefix,
	inferGeneratorPrefix,
	ParsedGenerator,
	parseGenerator,
} from './'
import os from 'os'

const parse = (name: string): ParsedGenerator => {
	const result = parseGenerator(name)
	return {
		...result,
		path: result.path
			.replace(os.homedir(), '~')
			// Replace back slashes with slashes (for Windows)
			.replace(/\\/g, '/'),
	}
}

describe('Parse generators', () => {
	it('GitHub repo', () => {
		const result = parse(`TimCrooker/grit-generator`)
		expect(result).toMatchInlineSnapshot(`
      Object {
        "hash": "0b2c5ee2",
        "path": "~/.grit/V2/generators/repos/0b2c5ee2",
        "prefix": "github",
        "repo": "grit-generator",
        "subGenerator": undefined,
        "type": "repo",
        "user": "TimCrooker",
        "version": "master",
      }
    `)
	})

	it('GitHub repo with version', () => {
		expect(parse(`TimCrooker/grit-generator#v1.0.0`)).toMatchInlineSnapshot(`
      Object {
        "hash": "272300b6",
        "path": "~/.grit/V2/generators/repos/272300b6",
        "prefix": "github",
        "repo": "grit-generator",
        "subGenerator": undefined,
        "type": "repo",
        "user": "TimCrooker",
        "version": "v1.0.0",
      }
    `)
	})

	it('Npm package', () => {
		expect(parse(`generator`)).toMatchInlineSnapshot(`
      Object {
        "hash": "62dbe401",
        "name": "grit-generator",
        "path": "~/.grit/V2/generators/packages/62dbe401/node_modules/grit-generator",
        "slug": "grit-generator",
        "subGenerator": undefined,
        "type": "npm",
        "version": "latest",
      }
    `)
	})

	it('Npm package with version', () => {
		expect(parse(`nm@2.0.1`)).toMatchInlineSnapshot(`
      Object {
        "hash": "136284f0",
        "name": "grit-nm",
        "path": "~/.grit/V2/generators/packages/136284f0/node_modules/grit-nm",
        "slug": "grit-nm@2.0.1",
        "subGenerator": undefined,
        "type": "npm",
        "version": "2.0.1",
      }
    `)
	})
	it('Scoped Npm package', () => {
		expect(parse(`@TimCroker/nm`)).toMatchInlineSnapshot(`
      Object {
        "hash": "7152f7bc",
        "name": "@TimCroker/grit-nm",
        "path": "~/.grit/V2/generators/packages/7152f7bc/node_modules/@TimCroker/grit-nm",
        "slug": "@TimCroker/grit-nm",
        "subGenerator": undefined,
        "type": "npm",
        "version": "latest",
      }
    `)
	})
	it('Scoped Npm package with version', () => {
		expect(parse(`@TimCroker/nm@2.0.1`)).toMatchInlineSnapshot(`
      Object {
        "hash": "181d9cb3",
        "name": "@TimCroker/grit-nm",
        "path": "~/.grit/V2/generators/packages/181d9cb3/node_modules/@TimCroker/grit-nm",
        "slug": "@TimCroker/grit-nm@2.0.1",
        "subGenerator": undefined,
        "type": "npm",
        "version": "2.0.1",
      }
    `)
	})
	it('prefix', () => {
		expect(parse(`gitlab:TimCroker/poi`)).toMatchInlineSnapshot(`
      Object {
        "hash": "286ea960",
        "path": "~/.grit/V2/generators/repos/286ea960",
        "prefix": "gitlab",
        "repo": "poi",
        "subGenerator": undefined,
        "type": "repo",
        "user": "TimCroker",
        "version": "master",
      }
    `)
	})
	it('Remove sao- pefix', () => {
		expect(parse(`grit-generator`)).toMatchInlineSnapshot(`
      Object {
        "hash": "62dbe401",
        "name": "grit-generator",
        "path": "~/.grit/V2/generators/packages/62dbe401/node_modules/grit-generator",
        "slug": "grit-generator",
        "subGenerator": undefined,
        "type": "npm",
        "version": "latest",
      }
    `)
	})
})

describe('Extract generator prefix', () => {
	it('gitlab', () => {
		expect(getGeneratorPrefix('gitlab:egoist/poi')).toBe('gitlab')
	})
	it('github', () => {
		expect(getGeneratorPrefix('github:egoist/poi')).toBe('github')
	})
	it('npm with version', () => {
		expect(getGeneratorPrefix('poi@2.0.1')).toBe('npm')
	})
	it('npm naked', () => {
		expect(getGeneratorPrefix('poi')).toBe('npm')
	})
	it('Extract generator prefix', () => {
		expect(getGeneratorPrefix('gitlab:egoist/poi')).toBe('gitlab')
	})
})

describe('Infer prefix from naked generator', () => {
	it('gitlab', () => {
		expect(inferGeneratorPrefix('gitlab:egoist/poi')).toBe('gitlab:egoist/poi')
	})

	it('naked github repo', () => {
		expect(inferGeneratorPrefix('egoist/poi')).toBe('github:egoist/poi')
	})

	it('naked npm', () => {
		expect(inferGeneratorPrefix('poi')).toBe(`npm:grit-poi`)
	})

	it('naked npm with version', () => {
		expect(inferGeneratorPrefix('poi@2.0.1')).toBe(`npm:grit-poi@2.0.1`)
	})

	it('scoped npm', () => {
		expect(inferGeneratorPrefix('@egoist/poi')).toBe(`npm:@egoist/grit-poi`)
	})

	it('scoped npm with version', () => {
		expect(inferGeneratorPrefix('@egoist/poi@2.0.1')).toBe(
			`npm:@egoist/grit-poi@2.0.1`
		)
	})
})
