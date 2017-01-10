/* globals describe, it */

'use strict'

const assert = require('assert')
const path = require('path')
const load = (file) => require(path.join(__dirname, file))

const sinon = require('sinon')

const promise = new Promise((resolve) => resolve())

const services = {
  fs: {
    readFile: sinon.stub().returns(promise),
    writeFile: sinon.stub().returns(promise),
    unlink: sinon.stub().returns(promise),
  },

  locker: {
    lock: sinon.stub().returns(promise),
    unlock: sinon.stub().returns(promise),
  },
}

const files = {
  old: {
    file1: 'file1-old',
    file2: 'file2-old',
  },
  new: {
    file1: 'file1-new',
    file2: 'file2-new',
  },
}

const dbust = load('dbust')(services)

describe('dbust', () => {
  it('should lock & read manifest, unlink old files, then write to and unlock manifest', () => {
    const manifest = path.join(__dirname, './manifest.json')

    services.fs.readFile.returns(new Promise((resolve) => resolve(JSON.stringify(files.old))))

    const cb = sinon.spy()

    return dbust({ manifest })(files.new, cb)
      .then(() => {
        assert(services.locker.lock.calledWith(`${manifest}.lock`), 'Lock manifest')
        assert(services.locker.unlock.calledWith(`${manifest}.lock`), 'Unlock manifest')

        assert(services.fs.readFile.calledWith(manifest, 'utf8'), 'Read manifest')
        assert(services.fs.writeFile.calledWith(manifest, JSON.stringify(files.new), 'utf8'), 'Write manifest')

        Object.values(files.old).forEach((file) => {
          assert(services.fs.unlink.calledWith(path.join(__dirname, 'public', file)))
        })

        assert(cb.called, 'Call callback')
      })

  })

  const errorTest = () => {
    const manifest = path.join(__dirname, './manifest.json')
    const spy = sinon.spy()

    return dbust({ manifest })({})
      .catch(spy)
      .then(() => {
        assert.strictEqual(spy.called, false, 'Make sure no errors were returned')
        assert(services.fs.writeFile.calledWith(manifest, '{}', 'utf8'), 'Make sure an empty object gets written')
      })
  }

  it('should use an empty opject if json invalid', () => {
    services.fs.readFile.returns(new Promise((resolve) => resolve('')))
    return errorTest()
  })

  it('should use an empty object if it can\'t read manifest', () => {
    services.fs.readFile.returns(new Promise((resolve, reject) => reject({ code: 'ENOENT' })))
    return errorTest()
  })

  it('should default to base of parent module\'s directory', () => {
    return dbust({})({})
      .then(() => {
        assert(services.fs.readFile.calledWith(path.join(__dirname, 'manifest.json'), 'utf8'))
      })
  })

})
