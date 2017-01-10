'use strict'

const path = require('path')

const fs = require('pn/fs')

const dbust = require(path.join(__dirname, './dbust.js'))({ fs })

module.exports = dbust
