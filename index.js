'use strict'

const _ = require('lodash')
const q = require('q')
const fs = require('pn/fs')
const path = require('path')
const locker = require('lockfile')
const through = require('through2')

module.exports = (files) => {
  const manifest = path.join(path.dirname(module.parent.filename), 'manifest.json')


  // Parse generator
  q.async(function *(){

    const data = { new: {} }

    // Lock manifest file
    ; yield q.nbind(locker.lock)(`${manifest}.lock`, { wait: 2000, retires: 200 })

    // Read old manifest
    data.old = yield fs.readFile(manifest, 'utf8')

    // Parse json
    data.old = JSON.parse(data.old)

    // Default values
    _.assign(data.new, data.old)

    const deletePromises = []

    // Parse object
    for(const file in files){
      data.new[file] = files[file]

      // If old file exists, delete it
      if(data.old[file] && data.old[file] !== data.new[file]) deletePromises.push(fs.unlink(`./public/js/${data.old[file]}`))
    }
    yield deletePromises

    // Unlock file
    ; yield q.nbind(locker.unlock)(`${manifest}.lock`)

    // Update manifest
    ; yield fs.writeFile(manifest, JSON.stringify(data.new), 'utf8')

  })()
    .catch(err => {
      if(typeof err === 'string') err = new Error(err)

      if(err.code === 'ENOENT' && path.basename(err.path) === 'manifest.json'){
        return fs.writeFile(manifest, '{}', 'utf8').then(module.exports)
      }

      console.log(err)
    })
    .done();
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
  return through.obj((file, encoding, callback) => {
    const files = {}

    files[path.basename(file.revOrigPath)] = path.basename(file.path)

    module.exports(files)

    callback(null, file)
  })
}
