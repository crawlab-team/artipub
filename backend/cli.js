#!/usr/bin/env node
import { command, parse } from 'commander';
import { resolve } from 'path';
import { exec } from 'child_process';

command('start')
  .description('Start ArtiPub backend server')
  .option('-D, --daemon', '用pm2后台启动服务,需已全局安装pm2,未安装则先执行 npm i -g pm2')
  .option('-p, --port <port>', 'port number', 27017)
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

    const configFile = resolve(__dirname, './ecosystem.config.js');
    // 开启后端服务
    if (options.daemon) {
      exec(`pm2 start ${configFile}`);
    } else {
      require('./dist/server');
    }
  })

parse(process.argv)
