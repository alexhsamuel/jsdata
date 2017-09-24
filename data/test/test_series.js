'use strict'

const data = require('data/data')

import test from 'ava';

test(t => {
  const series = data.makeSeries(['foo', 'bar', 'baz'], [6, 7, 8])
 	t.true(series.length == 3)
  t.true(series.get('foo') == 6)
  t.true(series.get('bar') == 7)
  t.true(series.get('baz') == 8)
})
