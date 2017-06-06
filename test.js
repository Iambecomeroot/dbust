/* global describe, it */

'use strict'

const path = require('path')
const assert = require('assert')
const process = require('process')

const sinon = require('sinon')

const files = {
  old: {
    file1: 'file1-old',
    file2: 'file2-old',
  },
  new: {
    file2: 'file2-new',
    file3: 'file3-new',
  },
}
files.merged = Object.assign({}, files.old, files.new)

const constructor = require(__dirname + '/dbust')
const dbust = constructor({})
const options = {
  manifest: __dirname + '/manifest.json',
}

describe('dbust.put', () => {
  it('should add files to manifest and be able to read them', () => {
    dbust.put(files.old)
    assert.deepEqual(dbust.get(), files.old, 'Make sure we can read files')
  })

  it('should replace old files', () => {
    dbust.put(files.new)
    assert.deepEqual(dbust.get(), files.merged, 'Replace olf files')
  })
})

describe('dbust.save', () => {
  it('it should write manifest file to disk', () => {

    // Reading manifest yields empty object
    const fs = {
      readFile: sinon.stub().returns(Promise.resolve('{}')),
      writeFile: sinon.stub().returns(Promise.resolve()),
    }

    const dbust = constructor({ fs })
    dbust.options(options)
    dbust.set({})

    // Add old files to manifest
    dbust.put(files.old)

    return dbust.save()
      .then(() => assert.deepEqual(
        fs.writeFile.firstCall.args,
        [ options.manifest, JSON.stringify(files.old), 'utf8' ],
        'Make sure manifest saved'
      ))
      .catch(assert.isError)
  })

  it('should overwrite files if there are newer versions', () => {

    // Reading manifest yields old files
    const fs = {
      readFile: sinon.stub().returns(Promise.resolve(JSON.stringify(files.old))),
      writeFile: sinon.stub().returns(Promise.resolve()),
    }

    const dbust = constructor({ fs })
    dbust.options(options)
    dbust.set(files.old)

    dbust.put(files.new)

    return dbust.save()
      .then(() => assert.deepEqual(
        fs.writeFile.firstCall.args,
        [ options.manifest, JSON.stringify(files.merged), 'utf8' ],
        'Make sure manifest saved'
      ))
  })

  it('should use an empty object if it can\'t read manifest', () => {

    // Reading manifest fails
    const fs = {
      readFile: sinon.stub().returns(Promise.reject({ code: 'ENOENT' })),
      writeFile: sinon.stub().returns(Promise.resolve()),
    }

    const dbust = constructor({ fs })
    dbust.options(options)
    dbust.set({})

    return dbust.save()
      .then(() => assert.deepEqual(
        fs.writeFile.firstCall.args,
        [ options.manifest, '{}', 'utf8' ],
        'Make sure empty object written'
      ))
  })

  it('should use an empty object if manifest has invalid JSON', () => {

    // Parsing json fails
    const fs = {
      readFile: sinon.stub().returns(Promise.resolve('not json')),
      writeFile: sinon.stub().returns(Promise.resolve()),
    }

    const dbust = constructor({ fs })
    dbust.options(options)
    dbust.set({})

    return dbust.save()
      .then(() => assert.deepEqual(
        fs.writeFile.firstCall.args,
        [ options.manifest, '{}', 'utf8' ],
        'Make sure empty object written'
      ))
  })
})

describe('dbust.options', () => {
  it('should use default options', () => {
    const dbust = constructor({})

    assert.deepEqual(
      dbust._getOptions(),
      { base: process.cwd(), manifest: process.cwd() + '/manifest.json' },
      'Use default settings'
    )
  })

  it('should get base from manifest if base is not set', () => {
    const dbust = constructor({})
    dbust._setOptions({})
    dbust.options({ manifest: '/some/weird/path/manfiest.json' })

    assert.equal(
      dbust._getOptions().base,
      '/some/weird/path',
      'Get base from manifest'
    )
  }) 

  it('should make relative manifest paths absolute', () => {
    const dbust = constructor({})
    dbust._setOptions({})
    dbust.options({ manifest: 'manifest.json' })

    assert.equal(
      dbust._getOptions().manifest,
      path.join(process.cwd(), 'manifest.json'),
      'Make path absolute'
    )
  })
})

