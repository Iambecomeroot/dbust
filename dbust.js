'use strict'

const path = require('path')

const co = require('co')

let options, fs, locker

const dbust = (files, cb, file) => {
  const { manifest } = options

  // Parse generator
  return co(function *(){

    const data = { new: {} }

    // Lock manifest file
    ; yield locker.lock(`${manifest}.lock`)

    // Read old manifest
    data.old = yield fs.readFile(manifest, 'utf8').catch(() => data.old = {})

    // Parse json
    try{
      data.old = JSON.parse(data.old)
    }catch(err){
      data.old = {}
    }

    // Default values
    Object.assign(data.new, data.old)

    // Parse object
    for(const file in files){
      data.new[file] = files[file]

      // If old file exists, delete it
      if(data.old[file] && data.old[file] !== data.new[file]){
        const f = data.old[file]
        fs.unlink(path.join(options.output, path.extname(f).substr(1), f)).catch(() => {})
        fs.unlink(path.join(options.output, path.extname(f).substr(1), `${f}.gz`)).catch(() => {})
      }
    }

    // Update manifest
    yield fs.writeFile(manifest, JSON.stringify(data.new), 'utf8')

    // Unlock file
    locker.unlock(`${manifest}.lock`).catch((err) => {
      if(err.code !== 'ENOENT') throw err
    })

    if(cb) cb(null, file)

  })
}

module.exports = (services) => {
  ({ fs, locker } = services)

  return (_options) => {
    options = _options

    // Make sure options is object
    if(!options || typeof options !== 'object') options = {}

    // Make sure base exists
    if(!('base' in options)){
      if('manifest' in options && path.isAbsolute(options.manifest)){
        options.base = path.dirname(options.manifest)
      }else{
        options.base = path.dirname(module.parent.filename)
      }
    }

    // Make sure manifest exists
    if(!('manifest' in options)) options.manifest = 'manifest.json'

    // Make sure manifest path is absolute
    if(!path.isAbsolute(options.manifest)) options.manifest = path.join(options.base, options.manifest)

    // Make sure output exists
    if(!('output' in options)) options.output = 'public'

    // Make sure output path is absolute
    if(!path.isAbsolute(options.output)) options.output = path.join(options.base, options.output)



    return dbust
  }
}
