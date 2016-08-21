"use strict"

const _             = require('underscore')
const benchmark     = require('./benchmark')
const data          = require('data/data')
const ops           = require('data/operations')

const args = benchmark.parseCommandLine()

const MIN = 0.1
const MAX = 0.3

function filter_sum_loop(arr) {
  const len = arr.length
  let sum = 0;
  for (let i = 0; i < len; ++i) {
    const x = arr[i]
    if (MIN <= x && x <= 0.3) sum = sum + x
  }
  return sum
}

function filter_sum(ser) {
  return ops.sum(ops.filter(ser, x => MIN <= x && x <= MAX))
}

function filter_sum_reduce(ser) {
  return ops.reduce(ser, (s, x) => (MIN <= x && x <= MAX) ? s + x : s, 0)
}

if (false) {
  // Check result!
  const len = 1024
  const arr = benchmark.randomF64(len)
  const key = benchmark.randomKey(len)
  const ser = new data.Series(key, arr)
  console.log(filter_sum_loop(arr), filter_sum(ser), filter_sum_reduce(ser))
}

for (const len of args.lengths) {
  const arr = benchmark.randomF64(len)
  const key = benchmark.randomKey(len)
  const ser = new data.Series(key, arr)
  const meta = {operation: 'filter-sum', type: 'f64', length: len, mem_size: len * 8}

  {
    const res = benchmark.time(filter_sum_loop, arr)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }

  if (false) {  // too slow!
    const res = benchmark.time(sum_reduce, arr)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }

  {
    const res = benchmark.time(filter_sum, ser)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }

  {
    const res = benchmark.time(filter_sum_reduce, ser)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }
}

