module.exports = {
    apps: [
      {
        name: 'vlink-nextjs',
        script: 'npm run start',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production'
        }
      },
      {
        name: 'vlink-worker',
        script: 'src/workers/ledgerWorker.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        env: {
          NODE_ENV: 'production'
        },
        error_log: './logs/worker-error.log',
        out_log: './logs/worker-out.log',
        log_log: './logs/worker-combined.log'
      }
    ]
  };