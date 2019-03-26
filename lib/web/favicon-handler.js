//Dependancies
const helpers = require('../helpers')

let handlers = function(data,callback){
    if(data.method == 'get'){
        helpers.getStaticAsset('favicon.ico',function(err,data){
            if(!err && data){
                callback(200,data,'favicon');
            }
            else{
                callback(500);
            }
        });
    }
    else{
        callback(405);
    }
};

module.exports = handlers;