'use strict'

const assert = require('assert')
const strict = assert.strictEqual
const path = require('path')
const load = (file) => require(path.join(__dirname, file))

const sinon = require('sinon')

const services = {
  fs: {
    readFile: sinon.stub(),
    writeFile: sinon.spy(),
  },

  locker: {
    lock: sinon.stub(),
    unlock: sinon.spy(),
  },
}

const dbust = load('dbust')(services)

describe('dbust', () => {
  it('should read manifest', () => {
    const manifest = path.join(__dirname, './manifest.json')
    services.fs.readFile.withArgs(manifest, 'utf8').returns(new Promise((resolve, reject) => resolve('{}')), () => '{}')
    services.locker.lock.returns(new Promise((resolve, reject) => resolve()), () => {})
    dbust({ manifest })({})
    assert(services.locker.lock.calledWith(`${manifest}.lock`))
  })
})
