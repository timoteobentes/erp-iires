module.exports = {
  apps: [
    {
      name: 'iires-system-api',
      script: 'dist/server.js',
      cwd: '/home/ubuntu/iires/erp-iires/backend',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3333,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3333,
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
