//Dependancies
const helpers = require('../helpers')

let handlers = function(data,callback){
    if(data.method == 'get'){
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if(trimmedAssetName.length > 0){
            helpers.getStaticAsset(trimmedAssetName,function(err,data){
                if(!err && data){
                    //Determine content type default to plain text
                    var contentType = 'plain';

                    if(trimmedAssetName.indexOf('.css') > -1){
                        contentType = 'css';
                    }
                    if(trimmedAssetName.indexOf('.png') > -1){
                        contentType = 'png';
                    }
                    if(trimmedAssetName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }
                    if(trimmedAssetName.indexOf('.ico') > -1){
                        contentType = 'ico';
                    }

                    callback(200, data,contentType);
                }
                else{
                    callback(404);
                }
            });
        }
        else{
            callback(404);
        }
    }
    else{
        callback(405);
    }
};

module.exports = handlers;