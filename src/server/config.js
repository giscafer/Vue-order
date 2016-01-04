/**
 * config
 */
var config = {
    // 站点名字
    name: 'Vue Order',
    //调试状态
    debug: true,
    //是否允许注册
    allow_sign_up: true,
    //注册是否需要激活邮箱
    need_active_mail:true,
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
    },
    //session设置
    session_secret: 'vueorder_secret', // session密匙
    session_collection: 'vueorder_secret', // 存放session的collection
    cookie_secret: 'vueorder_secret', // session密匙
    auth_cookie_name: 'vueorder_cookie', //cookie名称

    // redis 配置，默认是本地
    // redis_host: '127.0.0.1',
    // redis_port: 6379,
    // redis_db: 0,

    // sessionSecret: 'session_secret', // 务必修改
    // cookieName: 'vueorder_cookie',
    
    admins: {
        // user_login_name: true // admin 可删除话题，编辑标签，设某人为达人
    },
      // 邮箱配置 need_active_mail为true时，必须设置
    mail_opts: {
        debug:true,
        host: 'smtp.126.com',
        port: 25,
        auth: {
            user: 'gisbbs@126.com',
            pass: 'laohoubin0716'
        }
    }
};

module.exports = config;
