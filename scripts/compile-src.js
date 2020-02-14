const {spawn} = require('cross-spawn')
const result = spawn.sync(
  'tsc',
  [
    '--target',
    'es6',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--strict',
    'true',
    '--skipLibCheck',
    'true',
    '--incremental',
    '--noEmitOnError',
    'true'
  ],
  {
    stdio: 'inherit'
  }
)
process.exitCode = result.status
