'use strict'

const test          = require('ava')

const series        = require('../lib/series.js')

//------------------------------------------------------------------------------

test('single series', t => {
  const s = series.makeSeries(['foo', 'bar', 'baz'], [6, 7, 8])
  t.true(s.length == 3)
  t.true(s.get('foo') == 6)
  t.true(s.get('bar') == 7)
  t.true(s.get('baz') == 8)
})

test('indexed series', t => {
  const s = series.makeSeries(null, ['foo', 'bar', 'baz'])
  t.true(s.length == 3)
  t.true(s.get(0) == 'foo')
  t.true(s.get(1) == 'bar')
  t.true(s.get(2) == 'baz')
})

test('multi series', t => {
  const s = series.makeSeries(
    [['bar', 'foo', 'foo'], [2, 1, 2]], [100, 101, 102])
  t.true(s.length == 3)
  t.true(s.getAt(0) == 100)
  t.true(s.getAt(2) == 102)
  t.true(s.get('bar', 2) == 100)
  t.true(s.get('foo', 1) == 101)
  t.true(s.get('foo', 2) == 102)
})

test('leftJoin', t => {
  const l = series.makeSeries(['foo', 'bar', 'baz'], [6, 7, 8])
  const r = series.makeSeries(['baz', 'foo', 'bif', 'bom'], [1, 2, 3, 4])
  const j = series.joinLeft(l, r, 0)
  t.is(j.length, l.length)
  t.is(j.key, l.key)
  t.deepEqual(Array.from(j.key.labels[0]), ['bar', 'baz', 'foo'])
  t.deepEqual(Array.from(j.values), [0, 1, 2])
})

