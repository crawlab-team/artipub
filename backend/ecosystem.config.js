const path = require('path');
module.exports = {
  apps : [{
    cwd: path.resolve(__dirname, "./dist"),
    script: 'npm',
    exec_mode: 'cluster',
    instances: 1,
    args: 'run prod',
  }],
};
