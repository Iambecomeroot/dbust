'use strict'

const path = require('path')
const process = require('process')

const co = require('co')

let _options = {}
let fs

let manifest = {}

const set = obj => manifest = obj 
const get = () => manifest

const put = files => {
  // files.forEach(file => manifest[file] = files[file])
  Object.assign(manifest, files)
}

const save = cb => {
  const promise = co(function * () {

    if (typeof _options === 'undefined') options()

    const manifestFile = _options.manifest

    // Read old manifest
    let data = yield fs.readFile(manifestFile, 'utf8')
      .then(JSON.parse)
      .catch(() => ({}))

    Object.assign(data, manifest)

    // Update manifest
    yield fs.writeFile(manifestFile, JSON.stringify(data), 'utf8')

    if (typeof cb !== 'undefined') cb()
  })

  // If no callback is provided, return the promise
  if (typeof cb === 'undefined') return promise

  // Otherwise, catch errors and pass them to callback
  promise.catch(cb)
}

const options = newOptions => {

  Object.assign(_options, newOptions)

  // Make sure base exists
  if (!('base' in _options)) {
    if ('manifest' in _options && path.isAbsolute(_options.manifest)) {
      _options.base = path.dirname(_options.manifest)
    } else {
      _options.base = process.cwd()
    }
  }

  // Make sure manifest exists
  if (!('manifest' in _options)) _options.manifest = 'manifest.json'

  // Make sure manifest path is absolute
  if (!path.isAbsolute(_options.manifest)) _options.manifest = path.join(_options.base, _options.manifest)
}

const _getOptions = () => _options
const _setOptions = newOptions => _options = newOptions

module.exports = (services) => {
  ({ fs } = services)

  return {
    get,
    set,
    put,
    save,
    options,
    _getOptions,
    _setOptions,
  }
}
