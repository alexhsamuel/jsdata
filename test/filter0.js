dat = require('data/data')
ops = require('data/operations')

s = dat.sample
console.log('' + s)
console.log()

s = ops.filter(s, a => 1 < a && a < 3)
console.log('' + s)

