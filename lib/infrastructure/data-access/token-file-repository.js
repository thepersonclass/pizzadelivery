const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._tokenDirectory = 'tokens'

lib.create = function(userId, callback){

    let token = {
        'id': userId,
        'tokenId': helpers.createRandomString(20),
        'expires':  Date.now() + 1000 * 60 * 60
    }

    dataRepo.create(lib._tokenDirectory, token.tokenId, token, function(error){
        callback(error)
    })
}

lib.read = function(tokenId, callback){
    dataRepo.read(lib._tokenDirectory, tokenId, function(error, userData){
        callback(error, userData)
    })
}

lib.delete = function(tokenId, callback){
    dataRepo.delete(this._tokenDirectory, tokenId, function(error){
        callback(error)
    })
}

lib.tokenBelongsToUser = function(tokenId, userId, callback){
    lib.read(tokenId, function(error, tokenData){
        if(!error){
            if(tokenData.id == userId){
                callback(true)
            }
            else{
                callback(false)
            }
        }
        else{
            callback(false)
        }
    })
}

module.exports = lib
