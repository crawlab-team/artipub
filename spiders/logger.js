const log4js = require('log4js')

// 日志配置
const logger = log4js.getLogger()
logger.level = 'debug'

module.exports = logger
