import log4js =  require ('log4js')

// 日志配置
const logger = log4js.getLogger()
log4js.configure({
  appenders: {
    //设置控制台输出 （默认日志级别是关闭的（即不会输出日志））
    out: { type: "console" }
  },
  categories: {
    //appenders:采用的appender,取上面appenders项,level:设置级别
    default: { appenders: ["out"], level: "debug" }
  }
});
logger.level = 'debug'

export default logger
