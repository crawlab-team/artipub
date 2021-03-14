const path = require('path');
module.exports = {
  apps : [{
    cwd: path.resolve(__dirname, "./dist"),
    script: 'server.js',
    exec_mode: 'cluster',
    instances: 2,
    env: {

    }
  }],
};
