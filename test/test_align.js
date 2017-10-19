import { test } from 'ava'
import { align } from '../lib'

test('leftAlign', t => {
  const a0 = [2, 3, 5, 6, 8, 9]
  const a1 = [0, 1, 2, 4, 5, 7, 8]
  const an = align.leftAlign([a0], [a1])
  t.deepEqual(Array.from(an), [2, -1, 4, -1, 6, -1])
})

