'use strict'

const path = require('path')
const load = (file) => require(path.join(__dirname, file))

const fs = require('pn/fs')

const locker = load('locker.js')(fs)
const dbust = load('dbust.js')({ fs, locker })

module.exports = dbust
