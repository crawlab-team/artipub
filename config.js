module.exports = {
  HOST: '0.0.0.0',
  PORT: 3000,
  MONGO_HOST: process.env.MONGO_HOST ? process.env.MONGO_HOST : 'localhost',
  MONGO_PORT: process.env.MONGO_PORT ? process.env.MONGO_PORT : '27017',
  MONGO_DB: process.env.MONGO_DB ? process.env.MONGO_DB : 'artipub',
  MONGO_USERNAME: process.env.MONGO_USERNAME ? process.env.MONGO_USERNAME : '',
  MONGO_PASSWORD: process.env.MONGO_PASSWORD ? process.env.MONGO_PASSWORD : '',
  MONGO_AUTH_DB: process.env.MONGO_AUTH_DB ? process.env.MONGO_AUTH_DB : 'admin'
}
