"use strict"

const _             = require('underscore')
const benchmark     = require('./benchmark')
const data          = require('data/data')
const ops           = require('data/operations')

const args = process.argv.slice()
if (args[0].endsWith('node')) args.shift()
let lengths
if (args.length === 2) lengths = [args[1]]
else if (args.length === 3) lengths = _.range(+args[1], +args[2])
else {
  console.error(`usage: ${args[0]} SIZE [ SIZE1 ]`)
  process.exit(2)
}
lengths = lengths.map(l => 1 << l)

function sum_loop(arr) {
  const len = arr.length
  let sum = 0;
  for (let i = 0; i < len; ++i) sum = sum + arr[i]
  return sum
}

function sum_reduce(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

for (const len of lengths) {
  const arr = benchmark.randomF64(len)
  const key = benchmark.randomKey(len)
  const ser = new data.Series(key, arr)
  const meta = {operation: 'sum', type: 'f64', length: len, mem_size: len * 8}

  {
    const res = benchmark.time(sum_loop, arr)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }

  if (false) {  // too slow!
    const res = benchmark.time(sum_reduce, arr)
    console.log(JSON.stringify(Object.assign(res, meta)))
  }

  {
    const res = benchmark.time(ops.sum, ser)
    res.name = 'ops.sum'
    console.log(JSON.stringify(Object.assign(res, meta)))
  }
}

