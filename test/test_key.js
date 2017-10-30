'use strict'

const test          = require('ava')
const MultiKey      = require('../lib/key.js').MultiKey
const keymod        = require('../lib/key.js')

//------------------------------------------------------------------------------

test('MultiKey basic', t => {
  console.log(MultiKey)
  const key = new MultiKey(
    ['bar', 'baz', 'foo', 'foo'],
    [3, 4, 2, 3])
  t.true(key.length == 4)
  t.true(key.get('bar', 3) == 0)
  t.true(key.get('baz', 4) == 1)
  t.true(key.get('foo', 2) == 2)
  t.true(key.get('foo', 3) == 3)
  t.throws(() => key.get('foo', 4), Error)
})

