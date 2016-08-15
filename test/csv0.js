io = require('data/io')
synch = require('synchronize')

function readCsv(callback) {
  lineReader = require('readline').createInterface({
    // input: require('fs').createReadStream('test/accounts.csv')
    input: process.stdin
  })

  headers = null
  scanners = []

  lineReader.on('line', function (line) {
    const parts = line.split(',')
    if (headers === null) headers = parts
    else {
      const len = parts.length
      while (scanners.length < len)
        scanners.push(new io.ColumnScan())
      for (let i = 0; i < len; ++i)
        scanners[i].scan(parts[i])
    }
  })

  lineReader.on('close', function () { 
    callback(scanners)
  })
}

readCsv(function (scanners) {
  console.log('done')
  const len = Math.max(...scanners.map(s => s.length))
  console.log(len)
  console.log(scanners.map(s => s.type))
})

