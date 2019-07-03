const spawn = require('cross-spawn')
const {resolve} = require('path')
const {mkdirSync, copyFileSync} = require('fs')

try {
  mkdirSync(resolve('.dist'))
} catch (err) {}

try {
  copyFileSync(resolve('package.json'), resolve('.dist/package.json'))
} catch (err) {}

const result = spawn.sync(
  'yarn',
  ['--production', '--mutex', 'file:/tmp/.yarn-mutex'],
  {
    cwd: resolve('.dist')
  }
)

process.exit(result.status)
