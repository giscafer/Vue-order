/**
 * 数据库连接
 * @type {[type]}
 */
var mongoose = require('mongoose');
var util = require("util");

function MongooseKeeper() {
    this.db = mongoose.createConnection();
    this.open_count = 0;
}
//配置接口
MongooseKeeper.prototype.config = function(conf) {
  /*  var options = {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 4
        }
    };*/
    var opts = {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 5,
            auto_reconnect: true
        },
        user: conf.userid,
        pass: conf.password
    };

    var constr = "";
    if (process.env.MONGO_DB_STR) {
        constr = process.env.MONGO_DB_STR;
    } else {
        //'mongodb://user:pass@localhost:port/database'
        constr = util.format('mongodb://%s:%s@%s:%d/%s', conf.userid, conf.password, conf.host, conf.port, conf.database);
    }
    mongoose.connect(constr, function(err) {
        if (err) {
            console.error('connect to %s error: ', constr, err.message);
            // process.exit(1);
        }
    });
    var dbcon = mongoose.connection;
    // this.dbUri = constr;
    // this.options = options;
    //监听关闭事件并重连  
    dbcon.on('disconnected', function() {
        console.log('disconnected');
        dbcon.close();
    });
    dbcon.on('open', function() {
        console.log('connection success open');
        this.recon = true;
    });
    dbcon.on('close', function(err) {
        console.log('closed');
        // dbcon.open(host, dbName, port, opts, function() {  
        // console.log('closed-opening');  
        // });  
        reConnect('*');
    });

    function reConnect(msg) {
        console.log('reConnect' + msg);
        if (this.recon) {
            console.log('reConnect-**');
            dbcon.open(conf.host, conf.database, conf.port, opts, function() {
                console.log('closed-opening');
            });
            this.recon = false;
            console.log('reConnect-***');
        }
        console.log('reConnect-end');
    }
};
/*MongooseKeeper.prototype.open =function() {

    this.open_count++;
    if(this.open_count ==1 && this.db.readyState == 0)
    {        
        this.db.open(this.dbUri,this.options,function() {
            // body...
            console.log("db opened");
        });
    }
}
MongooseKeeper.prototype.close =function() {

    this.open_count--;
    if(this.open_count === 0 )
    {
        this.db.close(function(){
            console.log("db closed");
        });
    }



}
MongooseKeeper.prototype.use = function(action,callback) {
    //OPEN
    var self = this;
    self.open();
    action.call(null,function() {
        //CLOSE
        console.log("正在访问的数据库请求量"+self.open_count);
        self.close();
        callback.apply(null, arguments);
        //DONE
        self =null;
    });
};*/

exports = module.exports = new MongooseKeeper();
