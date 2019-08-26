const config = require('../config')
const mongoose = require('mongoose')

// mongodb连接
mongoose.Promise = global.Promise
if (config.MONGO_USERNAME) {
    mongoose.connect(`mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
} else {
    mongoose.connect(`mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`, { useNewUrlParser: true })
}

module.exports = {
    Article: require('./article'),
}
