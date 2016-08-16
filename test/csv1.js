'use strict'

const csv = require('data/csv')
csv.read('test/hmda-small.csv')
  .then(t => console.log(t.toString()))
  .catch(console.log)


