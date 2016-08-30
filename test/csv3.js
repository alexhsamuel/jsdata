const parse = require('csv-parse')
const fs = require('fs')

// Create the parser
const parser = parse({delimiter: ','})

// Use the writable stream api
parser.on('readable', () => {
  while (record = parser.read()) ; //console.log(record)
})

// Catch any error
parser.on('error', err => console.log(err.message))

// When we are done, test that the parsed output matched what expected
parser.on('finish', () => {
  console.log('done')
})

const input = fs.createReadStream('test/testcsv-1Mi.csv')
input.pipe(parser)

// Close the readable stream
// parser.end()

