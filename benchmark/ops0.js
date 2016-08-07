"use strict"

const data          = require('data/data')
const ops           = require('data/operations')
const callTimer     = require('data/call-timer')

const timer = callTimer.timer()

function time(label, fn, ...args) {
  console.log(label + ': ' + callTimer.format(timer(fn, ...args)))
}

const NUM           = 1 << 24
const GB            = 1 << 30
console.log('size = ' + (NUM * 8 / GB) + ' GB/array')

function randomSeries(num) {
  const key = new Uint32Array(num)
  let k = 0
  for (let i = 0; i < num; ++i) {
    key[i] = k
    k += 1 + Math.round((Math.random() * 4))
  }

  const val0 = new Float64Array(NUM)
  for (let i = 0; i < num; ++i) val0[i] = Math.random()
  const ser0 = data.makeSeries(key, val0)

  const val1 = new Float64Array(NUM)
  for (let i = 0; i < num; ++i) val1[i] = Math.random()
  const ser1 = new data.Series(ser0.labels, val1)

  return [ser0, ser1]
}

console.log('making series')
const [s0, s1] = randomSeries(NUM)
console.log('making series done')

function add(arr0, arr1, res) {
  const len = arr0.length
  if (typeof res === 'undefined')
    res = new Float64Array(len)
  for (let i = 0; i < len; ++i)
    res[i] = arr0[i] + arr1[i]
  return res
}

const arrays = []
function alloc() {
  const a = new Float64Array(NUM)
  // a.fill(0.0)
  for (let i = 0; i < NUM; i += 512) a[i] = 0.0
  arrays.push(a)
}

time('alloc  ', alloc)

function add2(arr0, arr1) {
  const r = arrays.pop()
  add(arr0, arr1, r)
  return r
}

function add3(arr0, arr1) {
  const len = arr0.length
  const r = new Float64Array(len)
  for (let i = 0; i < NUM; i += 512) r[i] = 0
  add(arr0, arr1, r)
  return r
}

const res = new Float64Array(NUM)

time('   add3', add3, s0.values, s1.values)
time('raw add', add, s0.values, s1.values)
time('pre add', add, s0.values, s1.values, res)
time('inp add', add, s0.values, s1.values, s1.values)
time('   add2', add2, s0.values, s1.values)
time('   add3', add3, s0.values, s1.values)
time('ops.add', ops.add, s0, s1)

