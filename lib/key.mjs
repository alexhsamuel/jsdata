import assert from 'assert'
import binary_search from 'binary-search'
import _ from 'underscore'

import * as permutation from './permutation.mjs'

/**
 * A set of labels consisting of a sorted unique array of values.
 */
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
}
