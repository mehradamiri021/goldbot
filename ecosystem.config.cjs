module.exports = {
  apps: [{
    name: 'goldbot',
    script: './server/index.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MT5_FILES_PATH: '/home/trader/.wine_mt5/drive_c/MT5-CX/MQL5/Files'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    cron_restart: '0 4 * * *', // Restart daily at 4 AM
  }]
};