module.exports = {
  platform: {
    JUEJIN: 'juejin',
    SEGMENTFAULT: 'segmentfault',
    JIANSHU: 'jianshu',
    CSDN: 'csdn',
    ZHIHU: 'zhihu',
    OSCHINA: 'oschina',
    TOUTIAO: 'toutiao',
  },
  status: {
    NOT_STARTED: 'not-started',
    PROCESSING: 'processing',
    FINISHED: 'finished',
    ERROR: 'error'
  },
  authType: {
    LOGIN: 'login',
    COOKIES: 'cookie'
  },
  editorType: {
    MARKDOWN: 'markdown',
    RICH_TEXT: 'rich-text'
  },
  environment: {
    UPDATE_STATS_CRON: 'update_stats_cron',
    ENABLE_CHROME_DEBUG: 'enable_chrome_debug',
  },
  cookieStatus: {
    NO_COOKIE: 'no_cookie',
    EXPIRED: 'expired',
    EXISTS: 'exists',
  },
}
