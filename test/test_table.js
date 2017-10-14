import _ from 'underscore'
import { test } from 'ava'
import { makeTable } from '../lib'

test('indexed table', t => {
  const tbl = makeTable(null, {foo: [3, 4, 5, 6], bar: ['a', 'c', 'd', 'b']})
  t.true(tbl.length == 4)
  t.true(_.isEqual(tbl.getAt(0), {foo: 3, bar: 'a'}))

  t.true(tbl.getAt(2).foo == 5)
  t.true(tbl.getAt(3).bar == 'b')

  t.true(_.isEqual(tbl.get(1), {foo: 4, bar: 'c'}))
  t.true(tbl.get(2).bar == 'd')
})
