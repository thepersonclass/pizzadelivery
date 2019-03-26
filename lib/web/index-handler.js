//Dependancies
const helpers = require('../helpers')

//Home page
let handlers = function(data,callback){
    //Reject any request that isn't a GET
    if(data.method == 'get'){

        //Prepare data for interpolation
        var templateData = {
            'head.title': 'Mondo Pizza - That\'s a big Pizza',
            'head.description' : 'Mondo Pizza has been making some of the biggest pizza of all time',
            'body.class' : 'index'
        };

        //Read in a template as a string
        helpers.getTemplate('index', templateData, function(err, str){
            if(!err && str){
                helpers.addUniversalTemplates(str, templateData, function(err,str){
                    if(!err && str){
                        callback(200,str,'html');
                    }
                    else{
                        callback(500,undefined,'html');
                    }
                });
            }
            else{
                callback(500,undefined,'html');
            }
        })
    }
    else{
        callback(405,undefined,'html');
    }
};

module.exports = handlers;