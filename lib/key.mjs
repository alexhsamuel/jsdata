import assert from 'assert'
import binary_search from 'binary-search'
import _ from 'underscore'

import * as format from './format.mjs'
import * as permutation from './permutation.mjs'

/**
 * A set of labels consisting of a sorted unique array of values.
 */
// FIXME: Special case of MultiKey... do we need it at all?
export class Key {
  constructor(labels) {
    // FIXME: Combine these two into one test.
    assert(permutation.isSorted(labels))
    assert(permutation.isUnique(labels))
    this.labels = labels
  }

  get length() { return this.labels.length }

  get(label) {
    const idx = binary_search(this.labels, label, permutation.cmp)
    assert(idx >= 0)  // FIXME: Throw.
    return idx
  }

  getAt(idx) {
    // FIXME: Check range.
    return this.labels[idx]
  }

  getFormat(opts={}) {
    return format.guess(this.labels)
  }
}

export class MultiKey {
  constructor(...labels) {
    // FIXME: Combine these two into one test.
    assert(permutation.isSortedMulti(labels))
    // assert(permutation.isUniqueMulti(labels))
    this.labels = labels
    this._length = permutation.same(_.pluck(labels, 'length'))
  }

  get length() { return this._length }

  get(...labels) {
    const [match, idx] = permutation.argsearchMulti(
      this.labels, labels, permutation.cmp)
    if (!match)
      throw new Error('no label ' + labels)
    return idx
  }

  getAt(idx) {
    // FIXME: Check range.
    return this.labels.map(l => l[idx])
  }
}

export class IndexKey {
  constructor(length) {
    this.length_ = length
  }

  get length() { return this.length_ }

  get(label) {
    const idx = +label
    assert(Number.isInteger(idx))  // FIXME: Throw.
    assert(0 <= idx && idx < this.length)
    return label
  }

  getAt(idx) {
    return idx
  }

  getFormat(opts={}) {
    return format.formatter(3)  // FIXME: Right number of digits.
  }
}

/**
 * Constructs a key from `labels`.
 *
 * @param labels
 *   A list of labels for a single key, or a list of lists of labels for
 *   a multi-key, or `null` for an index key.
 * @param length
 *   The expected key length.
 * @return
 *   A list of the key object, and a sort order that sorts the key or null
 *   for no sort.
 */
export function makeKey(labels, length) {
  if (labels === null) {
    return [new IndexKey(length), null]
  }
  else if (_.every(labels, Array.isArray)) {
    // FIXME: Sort!
    const key = new MultiKey(...labels)
    assert.equal(key.length, length)
    return [key, null]
  }
  else {
    // Single-column key.
    const [sorted_labels, sort] = permutation.sort(labels)
    const key = new Key(sorted_labels)
    assert.equal(key.length, length)
    return [key, sort]
  }
}
