'use strict'

const fs = require('pn/fs')
const path = require('path')
const co = require('co')
const through = require('through2')

const locker = {
  lock: (file) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      const lock = () => {
        fs.stat(file).then((stat) => {
          if(Date.now() > timestamp + 1000 * 10) return reject(new Error('Timeout while trying to lock file'))
          setTimeout(lock, 500)
        }).catch((err) => {
          if(typeof err !== 'object') err = new Error(err)
          if(err.code === 'ENOENT') return fs.writeFile(file, '').then(resolve)
          reject(err)
        })
      }
      lock()
    })
  },

  unlock: (file) => fs.unlink(file)
}

module.exports = (files, cb, file) => {
  const manifest = path.join(path.dirname(module.parent.filename), 'manifest.json')


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
    _.assign(data.new, data.old)

    // Parse object
    for(const file in files){
      data.new[file] = files[file]

      // If old file exists, delete it
      if(data.old[file] && data.old[file] !== data.new[file]) fs.unlink(`./public/${path.extname(data.old[file]).substr(1)}/${data.old[file]}`).catch(() => {})
    }

    // Update manifest
    ; yield fs.writeFile(manifest, JSON.stringify(data.new), 'utf8')

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

    console.log(err)
    locker.unlock(`${manifest}.lock`)
  })
}

module.exports.webpack = function(){
  this.plugin('done', stats => {
    const chunks = stats.compilation.chunks;
    const files  = {}

    for(let i = 0; i < chunks.length; i++){
      const chunk = chunks[i];
      const name  = `${chunk.name}.js`;

      files[name] = chunk.files[0];
    }

    module.exports(files)
  });
}

module.exports.gulp = () => {
  return through.obj((file, encoding, cb) => {
    const files = {}

    files[path.basename(file.revOrigPath)] = path.basename(file.path)

    module.exports(files, cb, file)
  })
}
