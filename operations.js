(function () { 
  const assert = require('assert')

  const data = require('./data.js')
  const Series = data.Series

  function binary(op, name) {
    // FIXME: Set name.
    return function(a, b) {
      if (a instanceof Series && b instanceof Series) {
        const labels = a.labels
        assert(Object.is(b.labels, labels))
        const res = a.values.slice()  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(res[i], b.values[i])
        return new Series(labels, res)
      }
      else if (a instanceof Series) {
        const res = a.values.slice()  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(res[i], b)
        return new Series(a.labels, res)
      }
      else if (b instanceof Series) {
        const res = b.values.slice()  // FIXME: Coerce types.
        for (let i = 0; i < res.length; ++i) res[i] = op(a, res[i])
        return new Series(b.labels, res)
      }
      else return op(a, b)
    }
  }

  module.exports = {
    add: binary((a, b) => a + b, 'add'),
    sub: binary((a, b) => a - b, 'sub'),
    mul: binary((a, b) => a * b, 'mul'),
    div: binary((a, b) => a / b, 'div'),
    mod: binary((a, b) => a % b, 'mod'),

  }
}).call(this)

