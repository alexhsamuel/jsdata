(function () {
  'use strict'

  const _ = require('underscore')
  const fastCsv = require('fast-csv')
  const data = require('data/data')
  const fs = require('fs')
  const io = require('data/io')

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
              scanners.push(new io.ColumnScan())
            for (let i = 0; i < len; ++i)
              scanners[i].scan(parts[i])
            ++rows
          }
        })
        .on('end', () => {
          const cols = _.zip(headers, scanners).map(
            ([name, s]) => ({name, type: s.type}))
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
              arrs[i][row - 1] = parts[i]
          ++row
        })
        .on('end', () => resolve())
    })
  }

  module.exports = {
    read(filename) {
      let arrs

      // First scan the file to determine column types.
      return scan(open(filename))
        .then(csv => {
          // Allocate column arrays.
          arrs = csv.cols.map(c => io.newArray(c.type, csv.rows))
          // Rescan the file, filling the column arrays.
          return readData(open(filename), arrs).then(() => csv)
        })
        .then(csv => {
          // Build a table from the column arrays.
          const cols = _.zip(csv.cols.map(_ => _.name), arrs)
          return new data.Table(new data.IndexKey(csv.rows), cols)
        }).catch(e => console.log(e))
    },

  }

}).call(this)
