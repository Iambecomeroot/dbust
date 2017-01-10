'use strict'

const path = require('path')

const co = require('co')

let options, fs, locker

const dbust = (files, cb, file) => {
  const { manifest } = options

  // Parse generator
  co(function *(){

    const data = { new: {} }

    // Lock manifest file
    ; yield locker.lock(`${manifest}.lock`)

    // Read old manifest
    data.old = yield fs.readFile(manifest, 'utf8')

    // Parse json
    data.old = JSON.parse(data.old)

    // Default values
    Object.assign(data.new, data.old)

    // Parse object
    for(const file in files){
      data.new[file] = files[file]

      // If old file exists, delete it
      if(data.old[file] && data.old[file] !== data.new[file]){
        const f = data.old[file]
        fs.unlink(`./public/${path.extname(f).substr(1)}/${f}`).catch(() => {})
        fs.unlink(`./public/${path.extname(f).substr(1)}/${f}.gz`).catch(() => {})
      }
    }

    // Update manifest
    yield fs.writeFile(manifest, JSON.stringify(data.new), 'utf8')

    // Unlock file
    locker.unlock(`${manifest}.lock`).catch((err) => {
      if(err.code !== 'ENOENT') throw err
    })

    if(cb) cb(null, file)

  }).catch(err => {
    if(typeof err === 'string') err = new Error(err)

    if(err.code === 'ENOENT' && path.basename(err.path) === 'manifest.json'){
      return fs.writeFile(manifest, '{}', 'utf8').then(() => module.exports(files, cb))
    }

    if(cb) cb(null, file)

    console.error(err)
    locker.unlock(`${manifest}.lock`)
  })
}

module.exports = (services) => {
  ({ fs, locker } = services)

  return (_options) => {
    options = _options

    if(!('manifest' in options)) options.manifest = path.join(options.base, 'manifest.json')

    return dbust
  }
}
