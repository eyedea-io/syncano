'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const spawn = require('cross-spawn')
const os = require('os')

module.exports = function(socketPath, socketName, originalDirectory, template) {
  const ownPath = path.dirname(
    require.resolve(path.join(__dirname, '..', 'package.json'))
  )
  const appPackage = require(path.join(socketPath, 'package.json'))

  // Setup the script rules
  appPackage.scripts = {
    build: 'syncano-scripts compile-src && syncano-scripts compile-env',
    'build:src': 'syncano-scripts compile-src',
    'build:env': 'syncano-scripts compile-env'
  }

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {}

  // TODO: Setup the eslint config
  // appPackage.eslintConfig = {
  //   extends: 'smashing-app'
  // }

  fs.writeFileSync(
    path.join(socketPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  )

  const readmeExists = fs.existsSync(path.join(socketPath, 'README.md'))
  if (readmeExists) {
    fs.renameSync(
      path.join(socketPath, 'README.md'),
      path.join(socketPath, 'README.old.md')
    )
  }

  // Copy the files for the user
  const templatePath = template
    ? path.resolve(originalDirectory, template)
    : path.join(ownPath, 'socket-template')
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, socketPath)
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    )
    return
  }

  try {
    const data = fs.readFileSync(path.join(socketPath, 'socket.yml'))
    const fd = fs.openSync(path.join(socketPath, 'socket.yml'), 'w+')
    const insert = Buffer.from(`name: ${socketName} \n`)
    fs.writeSync(fd, insert, 0, insert.length, 0)
    fs.writeSync(fd, data, 0, data.length, insert.length)
    fs.close(fd, err => {
      if (err) throw err
    })
  } catch (err) {
    console.error(
      `Could not update socket.yml with socket name: ${err.message}`
    )
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fs.moveSync(
      path.join(socketPath, 'gitignore'),
      path.join(socketPath, '.gitignore'),
      []
    )
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(socketPath, 'gitignore'))
      fs.appendFileSync(path.join(socketPath, '.gitignore'), data)
      fs.unlinkSync(path.join(socketPath, 'gitignore'))
    } else {
      throw err
    }
  }

  let command = 'yarnpkg'
  let args = ['add', '-D', '-E']

  args.push('typescript')

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(
    socketPath,
    '.template.dependencies.json'
  )
  if (fs.existsSync(templateDependenciesPath)) {
    const templateDependencies = require(templateDependenciesPath).dependencies
    args = args.concat(
      Object.keys(templateDependencies).map(key => {
        return `${key}@${templateDependencies[key]}`
      })
    )
    fs.unlinkSync(templateDependenciesPath)
  }

  console.log()

  const proc = spawn.sync(command, args, {stdio: 'inherit'})
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
    return
  }

  console.log()
  console.log(`Success! Created ${socketName} at ${socketPath}`)
  if (readmeExists) {
    console.log()
    console.log(
      chalk.yellow(
        'You had a `README.md` file, we renamed it to `README.old.md`'
      )
    )
  }
  console.log()
  console.log('Happy hacking!')
}
