#!/usr/bin/env node
const os = require('os')
const exec = require('child_process').exec
const path = require('path')
const program = require('caporal')

program
  .command('start', 'Start ArtiPub server')
  .option('-H, --host', 'MongoDB host name', null)
  .option('-P, --port', 'MongoDB port number', null, '27017')
  .option('-d, --db', 'MongoDB database name', null, 'artipub')
  .option('-u, --username', 'MongoDB username', null, '')
  .option('-p, --password', 'MongoDB password', null, '')
  .action((...arr) => {
    const cmdObj = arr[arr.length - 2]

    const umiCmd = path.join(
      __dirname,
      'node_modules',
      '.bin',
      os.platform()
        .match(/^win/) ? 'umi.cmd' : 'umi'
    ) + ' dev'

    // 开启前端服务
    console.log(umiCmd)
    exec(umiCmd, { shell: true })

    const host = cmdObj.host || 'localhost'
    const port = cmdObj.port || '27017'
    const db = cmdObj.db || 'artipub'
    const username = cmdObj.username || ''
    const password = cmdObj.password || ''

    process.env.MONGO_HOST = host
    process.env.MONGO_PORT = port
    process.env.MONGO_DB = db
    process.env.MONGO_USERNAME = username
    process.env.MONGO_PASSWORD = password

    // 开启后段服务
    require('./server')
  })

program.parse(process.argv)
