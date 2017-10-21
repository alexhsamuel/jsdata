import { test } from 'ava'
import { align } from '../lib'

test('leftAlign', t => {
  const a0 = [2, 3, 5, 6, 8, 9]
  const a1 = [0, 1, 2, 4, 5, 7, 8]
  const an = align.leftAlign([a0], [a1])
  t.deepEqual(Array.from(an), [2, -1, 4, -1, 6, -1])
})

test('leftAlign 2 remove', t => {
  const a0 = [
    ['a', 'a', 'b', 'b', 'b', 'd', 'f', 'f',],
    [ 2,   3,   1,   3,   8,   2,   0,   3, ],
  ]
  const a1 = [
    ['a',      'b', 'b', 'b',      'f', 'f',],
    [ 2,        1,   3,   8,        0,   3, ],
  ]
  const an = align.leftAlign(a0, a1)
  t.deepEqual(Array.from(an), [0, -1, 1, 2, 3, -1, 4, 5])
})

test('leftAlign 2 add', t => {
  const a0 = [
    [     'a', 'a',      'b', 'b', 'b', 'd', 'f', 'f',    ],
    [      2,   3,        1,   3,   8,   2,   0,   3,     ],
  ]
  const a1 = [
    ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'd', 'f', 'f', 'g',],
    [ 0,   2,   3,   5,   1,   3,   8,   2,   0,   3,   2, ],
  ]
  const an = align.leftAlign(a0, a1)
  t.deepEqual(Array.from(an), [1, 2, 4, 5, 6, 7, 8, 9])
})

