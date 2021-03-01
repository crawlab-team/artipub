#!/usr/bin/env node
const { version }= require('./package.json');
const path = require('path');
const exec = require('child_process').exec
const  program = require('commander')

const distDir = path.join(
  __dirname, './dist'
);

program
  .version(version)
  .command('start')
  .description('Start ArtiPub frontend server')
  .option('-h, --host <host>', 'host name', '127.0.0.1')
  .option('-p, --port <port>', 'port number', 8000)
  .action((options) => {
    const setUpCmd = `npx http-server ${distDir} -a ${options.host} -p ${options.port}`;

    // 开启前端服务
    console.log(`启动命令：${setUpCmd}`)
    console.log(`访问：http://127.0.0.1:${options.port} `)
    exec(setUpCmd, { shell: true })
  })

program.parse(process.argv)
