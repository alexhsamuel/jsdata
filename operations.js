(function () { 
  const assert = require('assert')

  const data = require('./data.js')
  const Series = data.Series

  module.exports = {
    add(a, b) {
      if (a instanceof Series && b instanceof Series) {
        const labels = a.labels
        assert(Object.is(b.labels, labels))
        const len = a.length
        const values = a.values.slice()  // FIXME: Type.
        for (let i = 0; i < len; ++i) values[i] = values[i] + b.values[i]
        return new Series(labels, values)
      }
      else if (a instanceof Series || b instanceof Series) {
        const [series, val] = a instanceof Series ? [a, b] : [b, a]
        const values = series.values.slice()
        const len = series.length
        for (let i = 0; i < len; ++i) values[i] = values[i] + val
        return new Series(series.labels, values)
      }
      else return a + b
    }

  }
}).call(this)

