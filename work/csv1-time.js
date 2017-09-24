'use strict'

const csv = require('data/csv')
const now = require('data/call-timer').now

const start = now()
csv.read('test/testcsv-1Mi.csv')
//.then(t => console.log(t.toString()))
  .then(() => console.log((now() - start) + ' s elapsed'))
  .catch(console.log)

