(function () { 
  const assert = require('assert')
  const data = require('data/data')

  const Series = data.Series

  // For now, this is all we got; no way to set a function name dynamically.
  const NAME = Symbol('name')
  function setName(fn, name) { 
    fn[NAME] = name
    return fn
  }

  function binary(op, name) {
    return setName(function (a, b) {
      if (a instanceof Series && b instanceof Series) {
        const labels = a.labels
        assert(Object.is(b.labels, labels))
        const res = new a.values.constructor(a.length)  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(a.values[i], b.values[i])
        return new Series(labels, res)
      }
      else if (a instanceof Series) {
        const res = new a.values.constructor(a.length)  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(a.values[i], b)
        return new Series(a.labels, res)
      }
      else if (b instanceof Series) {
        const res = new b.values.constructor(b.length)  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(a, b.values[i])
        return new Series(b.labels, res)
      }
      else return op(a, b)
    }, name)
  }

  function fold(op, initial, name) {
    return setName(function (ser) {
      let res = initial
      for (let i = 0; i < ser.length; ++i) res = op(res, ser.values[i])
      return res
    }, name)
  }

  function scan(op, initial, name) {
    return setName(function (ser) {
      let val = initial
      let values = ser.values
      let len = values.length
      const res = new values.constructor(len)  // FIXME: Coerce types.
      for (let i = 0; i < len; ++i) res[i] = val = op(val, values[i])
      return new Series(ser.labels, res)
    }, name)
  }

  function filter(series, pred) {
    const len = series.length
    const values = series.values
    const labels = series.key.labels

    const newLabels = new labels.constructor(len)
    const newValues = new values.constructor(len)

    let newLen = 0
    for (let i = 0; i < len; ++i) if (pred(values[i], labels[i])) {
      newLabels[newLen] = labels[i]
      newValues[newLen] = values[i]
      ++newLen
    }

    const key = newLen === len ? series.key 
          : new data.Key(newLabels.slice(0, newLen))
    return new data.Series(key, newValues.slice(0, newLen))
  }

  function map(series, fn) {
    const len = series.length
    const labels = series.key.labels
    const values = series.values
    const res = new series.values.constructor(len)
    for (let i = 0; i < len; ++i) res[i] = fn(values[i], labels[i])
    return new data.Series(series.key, res)
  }

  function reduce(series, acc, initial) {
    const len = series.length
    const labels = series.key.labels
    const values = series.values
    let res = initial
    for (let i = 0; i < len; ++i) res = acc(res, values[i], labels[i])
    return res
  }

  module.exports = {
    add: binary((a, b) => a + b, 'add'),
    sub: binary((a, b) => a - b, 'sub'),
    mul: binary((a, b) => a * b, 'mul'),
    div: binary((a, b) => a / b, 'div'),
    mod: binary((a, b) => a % b, 'mod'),

    sum: fold((a, b) => a + b, 0, 'sum'),

    cumsum: scan((a, b) => a + b, 0, 'cumsum'),

    filter,
    map,
    reduce,
  }
}).call(this)

