'use strict'

const csv = require('data/csv')
csv.read(process.argv[2])
  .then(t => console.log(t.toString()))
  .catch(console.log)

