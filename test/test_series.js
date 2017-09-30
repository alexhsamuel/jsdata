import { test } from 'ava'
import { makeSeries } from '../lib'

test(t => {
  const s = makeSeries(['foo', 'bar', 'baz'], [6, 7, 8])
 	t.true(s.length == 3)
  t.true(s.get('foo') == 6)
  t.true(s.get('bar') == 7)
  t.true(s.get('baz') == 8)
})
