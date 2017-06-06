'use strict'

const path = require('path')
const load = (file) => require(path.join(__dirname, file))

const fs = require('pn/fs')

const dbust = load('dbust.js')({ fs })

module.exports = dbust

