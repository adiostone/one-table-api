require('dotenv').config()

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME,
      script: './build/main.js',
      instances: 0, // use maximum processes possible according to the numbers of CPUs for supporting cluster mode
      exec_mode: 'cluster', // see https://pm2.keymetrics.io/docs/usage/cluster-mode/
      wait_ready: true, // wait for process.send(‘ready’)
      watch: ['build'], // watch build directory which is changed when the typescript code is build
      autorestart: true, // auto restart this app when watched things are changed
      max_restarts: 3, // number of consecutive unstable restarts before this app is considered errored and stop being restarted
      min_uptime: '5s', // see https://stackoverflow.com/questions/49195187/pm2-max-restarts-limit-not-working-and-continuous-restarting-crash-host-system?answertab=active#tab-top
      max_memory_restart: '2G',
      kill_timeout: process.env.APP_SHUTDOWN_TIMEOUT // set SIGKILL signal timeout for graceful shutdown
    }
  ]
}
