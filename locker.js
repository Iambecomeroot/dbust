'use strict'

let fs

const locker = {
  lock: (file) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      const lock = () => {
        fs.stat(file).then(() => {
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

module.exports = (_fs) => {
  fs = _fs
  return locker
}
