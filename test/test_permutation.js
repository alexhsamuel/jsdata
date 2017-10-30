'use strict'

const _ = require('underscore')
const test = require('ava').test

const permutation = require('../lib/permutation.js')

test('argsearchMulti basic0', t => {
  const arrs = [[30, 30, 40, 50], [2, 3, 1, 2]]
  const [match, idx] = permutation.argsearchMulti(arrs, [30, 3])
  t.true(match)
  t.true(idx == 1)
})

test('argsearchMulti basic1', t => {
  const arrs = [[30, 30, 40, 50], [2, 3, 1, 2]]
  const [match, idx] = permutation.argsearchMulti(arrs, [30, 2])
  t.true(match)
  t.true(idx == 0)
})

test('argsearchMulti basic2', t => {
  const arrs = [[30, 30, 40, 50], [2, 3, 1, 2]]
  const [match, idx] = permutation.argsearchMulti(arrs, [30, 1])
  t.false(match)
  t.true(idx == 0)
})

test('argsearchMulti basic3', t => {
  const arrs = [[30, 30, 40, 50], [2, 3, 1, 2]]
  const [match, idx] = permutation.argsearchMulti(arrs, [40, 0])
  t.false(match)
  t.true(idx == 2)
})

test('argsearchMulti overflow', t => {
  const arrs = [[30, 30, 40, 50], [2, 3, 1, 2]]
  const [match, idx] = permutation.argsearchMulti(arrs, [60, 1])
  t.false(match)
  t.true(idx == 4)
})
