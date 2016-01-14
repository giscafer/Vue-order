var mongoose = require('mongoose');
var config = require('../config');

/*mongoose.connect(config.dbUrl, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});*/
// models
require('./order');
require('./user');
require('./reply');
require('./message');

exports.Order = mongoose.model('Order');
exports.User = mongoose.model('User');
exports.Reply = mongoose.model('Reply');
exports.Message = mongoose.model('Message');
