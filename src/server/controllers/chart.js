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
    if(type!=='all'){
         var userId=req.session.user._id;
    }
    //mapReduce参数o
    var o = {};
    o.map = function () { 
        var cate=this.dish_name;
        emit(cate,{price:this.dish_price});
    }
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
    
    OrderProxy.queryByMapReduce(o,options,function(err,docs){
        if(err){
            return res.send({ success: false, message: err.message });
        }
       res.send({data:docs});
    });
    
}