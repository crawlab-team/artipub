#!/usr/bin/env node
const os = require('os')
const exec = require('child_process').exec
const path = require('path')
const program = require('commander')

program
  .command('start')
  .action(async () => {
    const umiCmd = path.join(
      __dirname,
      'node_modules',
      '.bin',
      os.platform().match(/^win/) ? 'umi' : 'umi.cmd'
    )
    exec(umiCmd, ['dev'])
    require('./server')
  })

program.parse(process.argv)
