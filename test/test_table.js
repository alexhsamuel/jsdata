import _ from 'underscore'
import { test } from 'ava'
import { makeTable, Series } from '../lib'

test('indexed table', t => {
  const tbl = makeTable(null, {foo: [3, 4, 5, 6], bar: ['a', 'c', 'd', 'b']})
  t.is(tbl.length, 4)
  t.deepEqual(tbl.names, ['foo', 'bar'])

  t.deepEqual(tbl.getAt(0), {foo: 3, bar: 'a'})
  t.is(tbl.getAt(2).foo, 5)
  t.is(tbl.getAt(3).bar, 'b')

  t.deepEqual(tbl.get(1), {foo: 4, bar: 'c'})
  t.is(tbl.get(2).bar, 'd')

  t.true(tbl.cols.foo instanceof Series)
  t.is(tbl.cols.bar.key, tbl.key)
  t.is(tbl.cols.foo.get(2), 5)
  t.is(tbl.cols.bar.get(0), 'a')
})

test('multikey table', t => {
  const tbl = makeTable(
    [
      ['bar', 'bar', 'foo'],
      [2, 3, 2]
    ],
    {
      val: [3.1415, 2.718, -1],
      name: ['Alice', 'Bob', 'Carol']
    }
  )

  t.is(tbl.length, 3)
  t.deepEqual(tbl.names, ['val', 'name'])

  t.deepEqual(tbl.get('bar', 3), {val: 2.718, name: 'Bob'})
  t.is(tbl.get('foo', 2).val, -1)
  t.is(tbl.get('bar', 2).name, 'Alice')

  t.is(tbl.cols.val.get('bar', 2), 3.1415)
  t.is(tbl.cols.name.getAt(2), 'Carol')
})
