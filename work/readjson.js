`use strict`

const fs = require('fs')
const ioJson = require('data/io/json')

ioJson.readRecords(fs.createReadStream('benchmark/filter-sum.json'))
  .then(tbl => console.log(tbl.toString()))
  .catch(console.log)

