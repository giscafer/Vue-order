/**
 * config
 */
var config = {
    debug: true,
    host: '127.0.0.1',
    port: 8000,
    // mongodb 配置
    //开发模式
    devMode: true,
    dev_dbUrl: 'mongodb://127.0.0.1/vue_order_dev',
    //如果devMode=true，则数据库连接使用dev_dbUrl，反之为dbConfig
    dbConfig: {
        "host": "mongo.duapp.com",
        "database": "SKxOiqMPLSnCBzpYNJLv",
        "userid": "a82c2085536e4175bff285baf7839fdb",
        "password": "e4db12d663f54c1a87a88933a81eee57",
        "port": 8908
    }
};

module.exports = config;
