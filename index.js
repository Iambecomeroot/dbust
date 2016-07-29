const q = require('q');
const fs = require('fs-promise');
const path = require('path');
const locker = require('proper-lockfile')
const through = require('through2')

module.exports = files => {
  const manifest = path.join(path.dirname(module.parent.filename), 'manifest.json')

  // Parse generator
  q.async(function*(){

    const data = {};

    // Check if exists
    exists = yield fs.exists(manifest)

    // Create manifest if it does not exist
    if(!exists) yield fs.writeFile(manifest, '{}', 'utf8')

    // Lock manifest file
    yield q.nbind(locker.lock)(manifest, { retires: 10 })

    // Read old manifest
    data.old = yield fs.readFile(manifest, 'utf8')

    // Parse json
    data.old = JSON.parse(data.old)

    // Default values
    data.new = data.old

    // Parse object
    for(const file in files){
      data.new[file] = files[file]

      // If old file exists, delete it
      if(data.old[file] !== data.new[file]) yield del(`./public/js/${data.old[name]}`)
    }

    // Unlock file
    yield q.nbind(locker.unlock)(manifest)

    // Update manifest
    yield fs.writeFile(manifest, JSON.stringify(data.new), 'utf8')

  })()
    .catch(err => {throw err})
    .done();
}

module.exports.webpack = function(){
  this.plugin('done', stats => {
    const chunks = stats.compilation.chunks;
    const files  = {}

    for(let i = 0; i < chunks.length; i++){
      const chunk = chunks[i];
      const name  = `${chunk.name}.js`;

      // Overwrite values
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
