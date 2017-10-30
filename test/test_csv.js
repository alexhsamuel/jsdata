'use strict'

const test          = require('ava')

const readCsv       = require('../lib/csv.js').read

//------------------------------------------------------------------------------

test('accounts', t => {
  return readCsv('test/accounts.csv').then(tbl => {
    // console.log('' + tbl)
    t.is(tbl.length, 5)
    t.deepEqual(tbl.names, ['id', 'name', 'balance'])
    t.is(tbl.get(2).name, 'Charlie')
    t.is(tbl.cols.balance.get(3), 400)
  })
})

test('prec', t => {
  return readCsv('test/prec.csv').then(tbl => {
    // console.log('' + tbl)
    t.is(tbl.length, 6)
  })
})

test('8k', t => {
  return readCsv('test/testcsv-8Ki.csv').then(tbl => {
    // console.log('' + tbl)
    t.is(tbl.length, 8192)
  })
})
