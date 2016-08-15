(function () {

  const _           = require('underscore')
  const callTimer   = require('data/call-timer')
  const data        = require('data/data')
  const timer       = callTimer.timer()

  module.exports = {

    randomF64(len) {
      const arr = new Float64Array(len)
      for (let i = 0; i < len; ++i) arr[i] = Math.random()
      return arr
    },

    randomKey(len) {
      const key = new Uint32Array(len)
      let k = 0
      for (let i = 0; i < len; ++i) {
        key[i] = k
        k += 1 + Math.round((Math.random() * 4))
      }
      return new data.Key(key)  // sorted by construction
    },

    randomSeries(len, num) {
      const key = this.randomKey(len)
      return _.times(num, () => new data.Series(key, this.randomF64(len)))
    },

    time(fn, ...args) {
      const res = timer(fn, ...args)
      Object.assign(res, callTimer.getEnvInfo())  // FIXME: Use object spread when available.
      return res
    },

  }

}).call(this)
