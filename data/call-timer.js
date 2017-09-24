(function () {
  const _       = require('underscore')
  const _now    = require('performance-now')
  const os      = require('os')

  const MSEC = 1E-3
  const USEC = 1E-6
  module.exports = {
    now() { return _now() * MSEC },

    /**
     * Times invocation of zero-argument `fn`.
     *
     * @return
     *   An array of the runtime in sec and the return value.
     */
    time(fn, count=1) {
      const start = this.now()
      for (let i = 0; i < count; ++i) fn()
      return this.now() - start
    },

    estimateCount(fn, minTime=MSEC) {
      let count
      for (count = 1; this.time(fn, count) < minTime; count *= 10) {}
      return count
    },

    // FIXME: Elsewhere?
    formatTime(time) {
      let res = 
          time < 500E-9 ? (time / 1E-9).toFixed(1) + ' ns'
        : time < 500E-6 ? (time / 1E-6).toFixed(1) + ' µs'
        : time < 500E-3 ? (time / 1E-3).toFixed(1) + ' ms'
        : time.toFixed(2) + ' s '
      return ('     ' + res).slice(-8)
    },

    timer({samples=100, warmUp=1, minSampleTime=10 * USEC, quantile=0.10}={}) {
      const mod = this

      return function (fn, ...args) {
        const call = () => fn(...args)

        // Do some un-timed warm up calls.
        _.times(warmUp, call)

        // Choose the count so the sample time isn't too small.
        const count = mod.estimateCount(call, minSampleTime)

        // Sample the timing.
        const times = _(samples).times(() => mod.time(call, count) / count)

        // Use the given quantile as the timing result.
        times.sort((a, b) => a - b)
        const time = times[Math.round(times.length * quantile)]

        return {
          name: fn.name,
          time,
          samples,
          count,
        }
      }
    },

    getEnvInfo() {
      return {
        arch          : os.arch(),
        host          : os.hostname(),
        language      : 'node.js',
        language_ver  : process.versions.node,
        os            : os.type(),
        os_ver        : os.release(),
        timestamp     : (new Date()).toISOString(),
      }
    },

  }

}).call(this)

