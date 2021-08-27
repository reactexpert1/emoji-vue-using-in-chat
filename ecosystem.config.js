module.exports = {
  apps: [{
    name: 'chat-emoji-vue',
    script: 'server/app.js',
    env: {
      COMMON_VARIABLE: 'true'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
  deploy: {
    production: {
      user: 'truedev',
      host: '10.10.13.211',
      ref: 'origin/master',
      repo: 'git@github.com:truedev718/chat-emoji-vue.git',
      path: '/www/vue-chatroom',
      'post-deploy': 'git pull && chmod +x ./run.sh && ./run.sh && pm2 reload ecosystem.config.js --env production'
    }
  }
};
