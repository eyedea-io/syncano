'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const fs = require('fs-extra')
const path = require('path')
const chalk = require('react-dev-utils/chalk')
const spawn = require('react-dev-utils/crossSpawn')
const os = require('os')

module.exports = function(appPath, appName, originalDirectory, template) {
  const ownPath = path.dirname(
    require.resolve(path.join(__dirname, '..', 'package.json'))
  )
  const appPackage = require(path.join(appPath, 'package.json'))

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {}

  // Setup the script rules
  appPackage.scripts = {
    build: 'syncano-scripts compile-src && syncano-scripts compile-env',
    'build:src': 'syncano-scripts compile-src',
    'build:env': 'syncano-scripts compile-env'
  }

  // TODO: Setup the eslint config
  // appPackage.eslintConfig = {
  //   extends: 'smashing-app'
  // }

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  )

  const readmeExists = fs.existsSync(path.join(appPath, 'README.md'))
  if (readmeExists) {
    fs.renameSync(
      path.join(appPath, 'README.md'),
      path.join(appPath, 'README.old.md')
    )
  }

  // Copy the files for the user
  const templatePath = template
    ? path.resolve(originalDirectory, template)
    : path.join(ownPath, 'socket-template')
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath)
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    )
    return
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    )
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'))
      fs.appendFileSync(path.join(appPath, '.gitignore'), data)
      fs.unlinkSync(path.join(appPath, 'gitignore'))
    } else {
      throw err
    }
  }

  let command = 'yarnpkg'
  let args = ['add', '-D', '-E']

  args.push('typescript')

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(
    appPath,
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

  // Install react and react-dom for backward compatibility with old CRA cli
  // which doesn't install react and react-dom along with react-scripts
  // or template is presetend (via --internal-testing-template)

  console.log()

  const proc = spawn.sync(command, args, {stdio: 'inherit'})
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`)
    return
  }

  console.log()
  console.log(`Success! Created ${appName} at ${appPath}`)
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
