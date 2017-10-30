'use strict'

const _             = require('underscore')
const fastCsv       = require('fast-csv')
const fs            = require('fs')

const makeTable     = require('./table.js').makeTable
const typed_array   = require('./typed-array.js')

//------------------------------------------------------------------------------

function open(filename) {
  return fs.createReadStream(filename)
}

function scan(input) {
  return new Promise((resolve, reject) => {
    let headers = null
    let rows = 0
    const scanners = []

    input.pipe(fastCsv())
      .on('data', parts => {
        if (headers === null) headers = parts.map(h => h.trim())
        else {
          const len = parts.length
          while (scanners.length < len)
            scanners.push(new typed_array.TypeScanner())
          for (let i = 0; i < len; ++i)
            scanners[i].scanString(parts[i].trim())
          ++rows
        }
      })
      .on('end', () => {
        const cols = _.zip(headers, scanners).map(
          ([name, s]) => ({name, type: s.type == 'f32' ? 'f64' : s.type}))
        resolve({cols, rows})
      })
  })
}

function readData(input, arrs) {
  return new Promise((resolve, reject) => {
    const cols = arrs.length
    let row = 0

    input.pipe(fastCsv())
      .on('data', parts => {
        if (row > 0)
          for (let i = 0; i < cols; ++i)
            arrs[i][row - 1] = parts[i].trim()  // FIXME: Sketch.
        ++row
      })
      .on('end', () => resolve())
  })
}

function read(filename) {
  let arrs
  // First scan the file to determine column types.
  return scan(open(filename))
    .then(csv => {
      // Allocate column arrays.
      arrs = csv.cols.map(c => typed_array.newArray(c.type, csv.rows))
      // Rescan the file, filling the column arrays.
      return readData(open(filename), arrs).then(() => csv)
    })
    .then(csv => {
      // Build a table from the column arrays.
      const cols = {}
      // FIXME: Better way to do this?
      _.zip(csv.cols, arrs).map(([c, a]) => { cols[c.name] = a })
      return makeTable(null, cols)
    })
}

//------------------------------------------------------------------------------

module.exports = {
  read
}

