'use strict'

const csv = require('data/csv')
const ops = require('data/operations')

const filename = process.argv[2]
csv.read(filename)
  .then(t => {
    for (let name in t.cols) console.log(name, t.cols[name].summary)
  })
  .catch(console.log)

