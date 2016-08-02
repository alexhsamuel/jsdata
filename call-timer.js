(function () {
  const _ = require('underscore')
  const _now = require('performance-now')

  const MSEC = 1E-3
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
      console.log('estimating:', count)
      const elapsed = time(fn, count)
      if (elapsed > minTime) return elapsed / count
    }
  }

  function rawTimer({target, trials} = {target: 1, trials: 8}) {
    return function (fn, ...args) {
      const call = () => fn(...args)

      const estimate = estimateTime(call)
      console.log('estimate:', estimate)
      const count = Math.max(1, Math.round(target / trials / estimate))
      console.log('count:', count)

      return _(trials).times(() => time(call, count) / count)
    }
  }

  function timer(timerArgs = {percentile: [0.05, 0.10, 0.15]}) {
    const rawTimer = rawTimer(timerArgs)

    return function (fn, ...args) {
      const name = fn.name
      const [times, result] = rawTimer(fn, ...args)

      console.log(times)
      const sorted = times.sort()
      const num = sorted.length
      const getPct = p => sorted[Math.round(num * p)]
      console.log(args)
      const [pct_lo, pct, pct_hi] = timerArgs.percentile
      const time = getPct(pct)
      const timeErr = getPct(pct_hi) - getPct(pct_lo)
      const size = args.length > 0 ? args[0].length : 0
      const totalSize = args.reduce((s, a) => s + (a.length || 0), 0)

      return {
        function: name,
        size: size,
        totalSize: totalSize,
        trials: num,
        time: time,
        timeErr: timeErr
      }
    }
  }

  module.exports = {
    MSEC: 1E-3,
    USEC: 1E-6,
    NSEC: 1E-9,
    
    timer: timer,
    rawTimer: rawTimer,
    now: now,
    time: time,
  }

}).call(this)


