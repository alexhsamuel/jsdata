(function () {
  const _ = require('underscore')
  const _now = require('performance-now')

  const MSEC = 1E-3
  const USEC = 1E-6
  const now = () => _now() * MSEC

  /**
   * Times invocation of zero-argument `fn`.
   *
   * @return
   *   An array of the runtime in sec and the return value.
   */
  function time(fn, count=1) {
    const start = now()
    for (let i = 0; i < count; ++i) fn()
    const end = now()
    return end - start
  }

  function estimateTime(fn, minTime=MSEC) {
    for (let count = 1;; count *= 10) {
      const elapsed = time(fn, count)
      if (elapsed > minTime) return elapsed / count
    }
  }

  function timer({minTime, minTrials, percentile}={minTime: 1, minTrials: 20, percentile: 0.10}) {
    return function (fn, ...args) {
      const name = fn.name
      const call = () => fn(...args)

      // Estimate the run time of one call.
      const estimate = estimateTime(call)
      // Based on this, choose a call count for timing that takes a reasonable
      // time to run.
      const count = Math.max(1, Math.round(50 * USEC / estimate))

      // FIXME: Estimate and subtract timing overhead.

      // Time the function.
      const times = []
      const start = now()
      while (times.length < minTrials || now() - start < minTime)
        times.push(time(call, count) / count)

      const sorted = times.sort((a, b) => a - b)
      const timeEst = sorted[Math.round(sorted.length * percentile)]

      return {
        function: name,
        trials: times.length,
        time: timeEst,
      }
    }
  }

  module.exports = {
    now: now,
    time: time,
    timer: timer,
  }

}).call(this)

