'use strict'

const _ = require('underscore')
const data = require('data/data')
const fs = require('fs')
const io = require('data/io')
const readline = require('readline')

function parseLine(line) {
  return line.split(',').map(s => s.trim())
}

function open(filename) {
  return fs.createReadStream(filename)
}

/* async */ function scan(input) {
  return new Promise((resolve, reject) => {
    const lineReader = readline.createInterface({ input: input })

    let headers = null
    let rows = 0
    const scanners = []

    lineReader.on('line', function (line) {
      const parts = parseLine(line)
      if (headers === null) headers = parts
      else {
        const len = parts.length
        while (scanners.length < len)
          scanners.push(new io.ColumnScan())
        for (let i = 0; i < len; ++i)
          scanners[i].scan(parts[i])
        ++rows
      }
    })

    lineReader.on('close', function () { 
      const cols = _.zip(headers, scanners).map(
        ([name, s]) => ({name, type: s.type}))
      resolve({cols, rows})
    })
  })
}

function readData(input, csv) {
  return new Promise((resolve, reject) => {
    const cols = csv.cols.length
    const lineReader = readline.createInterface({input: input})

    let row = 0
    lineReader.on('line', function (line) {
      const parts = parseLine(line)
      if (row > 0)
        for (let i = 0; i < cols; ++i)
          csv.arrs[i][row - 1] = parts[i]
      ++row
    })

    lineReader.on('close', function () {
      resolve(csv)
    })
  })
}

function read(filename) {
  return scan(open(filename)).then(csv => {
    csv.arrs = csv.cols.map(c => io.newArray(c.type, csv.rows))
    return readData(open(filename), csv)
  }).then(csv => {
    const labels = new Int32Array(_.range(csv.rows))
    const cols = _.zip(csv.cols.map(_ => _.name), csv.arrs)
    return new data.Table(new data.Key(labels), cols)
  }).catch(e => console.log(e))
}

read('test/hmda-small.csv').then(t => console.log(t.toString())).catch(console.log)


