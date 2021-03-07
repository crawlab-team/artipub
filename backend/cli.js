#!/usr/bin/env node
const { version }= require('./package.json');
const  program = require('commander')

program
  .version(version)
  .command('start')
  .description('Start ArtiPub backend server')
  .option('-H, --host <host>', 'mongodb host name', '127.0.0.1')
  .option('-p, --port <port>', 'port number', 27017)
  .option('-d, --dbname <dbname>', 'database name', 'artipub')
  .option('-u, --username <username>', 'mongodb username', '')
  .option('-P, --password <password>', 'mongodb password', '')
  .action((options) => {

    const host = options.host || 'localhost'
    const port = options.port || '27017'
    const db = options.dbname || 'artipub'
    const username = options.username || ''
    const password = options.password || ''

    process.env.MONGO_HOST = host
    process.env.MONGO_PORT = port
    process.env.MONGO_DB = db
    process.env.MONGO_USERNAME = username
    process.env.MONGO_PASSWORD = password

    // 开启后端服务
    require('./src/server')
  })

program.parse(process.argv)
