const {resolve} = require('path')
const spawn = require('cross-spawn')

const args = process.argv.slice(2)
const scriptIndex = args.findIndex(x => x === 'test')

const result = spawn.sync(
  resolve('node_modules/@eyedea/syncano/node_modules/.bin/jest'),
  [args.slice(scriptIndex + 1)],
  {
    stdio: 'inherit'
  }
)

process.exit(result.status)
