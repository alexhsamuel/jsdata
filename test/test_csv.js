import { test } from 'ava'

import { readCsv } from '../lib'

test('accounts', t => {
  return readCsv('test/accounts.csv').then(tbl => {
    console.log('' + tbl)
    t.is(tbl.length, 5)
    t.deepEqual(tbl.names, ['id', 'name', 'balance'])
    t.is(tbl.get(2).name, 'Charlie')
    t.is(tbl.cols.balance.get(3), 400)
  })
})

test('prec', t => {
  return readCsv('test/prec.csv').then(tbl => {
    console.log('' + tbl)
    t.is(tbl.length, 6)
  })
})

test('8k', t => {
  return readCsv('test/testcsv-8Ki.csv').then(tbl => {
    console.log('' + tbl)
    t.is(tbl.length, 8192)
  })
})
