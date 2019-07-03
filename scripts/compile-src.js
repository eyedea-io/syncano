const spawn = require('cross-spawn')
const {resolve} = require('path')

spawn.sync('node', [
  resolve('node_modules/.bin/tsc'),
  '--target',
  'es6',
  '--module',
  'commonjs',
  '--moduleResolution',
  'node',
  '--sourceMap',
  'true',
  '--strict',
  'true'
])
