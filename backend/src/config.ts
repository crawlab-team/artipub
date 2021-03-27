//docker --link 连接独立部署的mongo容器时使用
const mongodbContainerAddr = Object.entries(process.env).find((entry) => entry[0].endsWith('_TCP_ADDR'));
const addr = mongodbContainerAddr ? mongodbContainerAddr[1] : '127.0.0.1';

const mongodbContainerPort = Object.entries(process.env).find((entry) => entry[0].endsWith('_TCP_PORT'));
const port = mongodbContainerPort ? mongodbContainerPort[1] : '27017';

export const SECRET = 'artipub';
export const TOKEN = 'apt';

export default {
  HOST: '0.0.0.0',
  PORT: 3000,
  MONGO_HOST: process.env.MONGO_HOST ? process.env.MONGO_HOST : addr,
  MONGO_PORT: process.env.MONGO_PORT ? process.env.MONGO_PORT : port,
  MONGO_DB: process.env.MONGO_DB ? process.env.MONGO_DB : 'artipub',
  MONGO_USERNAME: process.env.MONGO_USERNAME ? process.env.MONGO_USERNAME : '',
  MONGO_PASSWORD: process.env.MONGO_PASSWORD ? process.env.MONGO_PASSWORD : '',
  MONGO_AUTH_DB: process.env.MONGO_AUTH_DB ? process.env.MONGO_AUTH_DB : 'admin'
}
