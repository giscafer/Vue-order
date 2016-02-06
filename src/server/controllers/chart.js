/**
 * 图表统计
 */
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var UserProxy = require('../proxy').User;
/**
 * 统计页
 */
exports.index=function(req,res,next){
    res.locals.current_page='charts'
	res.render('charts/charts', {
	    title: '图表统计'
	});
};
/**
 * 订餐查询统计
 */
exports.statistics=function(req,res,next){
    var type=req.params.type;
    if(type==='personal'){//个人排行
         var userId=req.session.user._id;
    }
    //mapReduce参数o
    var o = {};
    if(type==='rich'){//土豪排行
         o.map = function () { 
            var cate=this.user_id;
            emit(cate,{price:this.dish_price});
        }
    }else{
         o.map = function () { 
            var cate=this.dish_name;
            emit(cate,{price:this.dish_price});
        }
    }
   //默认是all，热门排行统计
    o.reduce = function (k, vals) {
        var sum=0;
        var totalCost=0;
        vals.forEach(function(order){
            sum+=1
            totalCost+=order.price;
        });
        return {count:sum,cost:totalCost};
    }
    o.out = { replace: 'order_results' };
    
    if(userId){
        o.query={
            user_id:userId.toString()
        };
    }
    
    o.verbose = true;
    //model find条件
    var options={
       query:null,
       opt: {limit:5,sort: '-value.count'}
    }
    if(type==='rich'){
        options.opt.limit=10;
        options.opt.sort='-value.cost';
        
        OrderProxy.queryByMapReduce(o,options,function(err,docs){
            if(err){
                return res.send({ success: false, message: err.message });
            }
            var ep=new EventProxy();
            ep.fail(next);
            ep.after('after_user',docs.length,function(){
                res.send({data:docs});
            });
            docs.forEach(function(item,i){
                var user_id=item._id;
                var proxy=new EventProxy();
                proxy.on('user',function(user){
                    if(user){
                        item.username=user.name;
                    }else{
                        item.username='火星人';
                    }
                    ep.emit('after_user');
                });
                UserProxy.getUserById(user_id,proxy.done('user'));
            });
        });
        
    }else{
        OrderProxy.queryByMapReduce(o,options,function(err,docs){
            if(err){
                return res.send({ success: false, message: err.message });
            }
            res.send({data:docs});
        });
    }
    
    
}