
/**
 * 订餐控制器
 */
var request = require('sync-request');
var os = require('os');
var baiduApiKey =  'K1jRXLt19Dbtuc6A1f4nlUZS4WG1egtx';

exports.userLocation = function(){
    var path = 'https://api.map.baidu.com/highacciploc/v1?extensions=1&qterm=pc&ak='+baiduApiKey+'&coord=bd09ll';
    var res = request('GET', path);
    try {
            var responseJson = JSON.parse(res.getBody().toString());
            return responseJson;
        } catch (error) {
            // 解析失败
            console.log(i + ": Error!" + error.stack);
            console.log(body); // 输出body以供参考
        }
};
exports.getClientIP = function(req){
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(ifname + ':' + alias, iface.address);
            } else {
                // this interface has only one ipv4 adress
                console.log(ifname, iface.address);
            }
            ++alias;
        });
    });
    return "IPv4";
}
exports.getNearbyCate = function(req){
    var path = 'https://api.map.baidu.com/highacciploc/v1?extensions=1&qterm=pc&ak=K1jRXLt19Dbtuc6A1f4nlUZS4WG1egtx&coord=bd09ll';
    var res = request('GET', path);
    try {
            var responseJson = JSON.parse(res.getBody().toString());
            return responseJson;
        } catch (error) {
            // 解析失败
            console.log(i + ": Error!" + error.stack);
            console.log(body); // 输出body以供参考
        }
}