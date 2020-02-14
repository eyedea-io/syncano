const spawn = require('cross-spawn')
const {resolve} = require('path')
const {mkdirSync, readFileSync, writeFileSync} = require('fs')

try {
  mkdirSync(resolve('.dist'))
} catch (err) {
  //
}

try {
  const packageJsonFile = readFileSync(resolve('package.json'), {
    encoding: 'utf-8'
  })
  const packageJson = JSON.parse(packageJsonFile)
  const dependencyKeys = [
    'dependencies',
    'devDependencies',
    'optionalDependencies'
  ]
  dependencyKeys.forEach(key => {
    if (packageJson && typeof packageJson[key] === 'object') {
      const dependencyObject = packageJson[key]
      Object.keys(packageJson[key]).forEach(depName => {
        if (dependencyObject[depName].indexOf('../') === 0) {
          dependencyObject[depName] = `../${dependencyObject[depName]}`
        }
      })
    }
  })

  writeFileSync(
    resolve('.dist/package.json'),
    JSON.stringify(packageJson, null, ' ')
  )
} catch (err) {
  throw new Error('Malformed package.json file!')
}

const result = spawn.sync(
  'yarn',
  ['--production', '--mutex', 'file:/tmp/.yarn-mutex'],
  {
    cwd: resolve('.dist')
  }
)

process.exitCode = result.status
