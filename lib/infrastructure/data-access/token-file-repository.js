const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._orderDirectory = 'tokens'

lib.create = function(userId, callback){

    let token = {
        'id': userId,
        'tokenId': helpers.createRandomString(20),
        'expires':  Date.now() + 1000 * 60 * 60
    }

    dataRepo.create(lib._orderDirectory, userId, token, function(error){
        callback(error)
    })
}

lib.read = function(userId, callback){
    dataRepo.read(lib._orderDirectory, userId, function(error, userData){
        callback(error, userData)
    })
}

lib.delete = function(userId, callback){
    dataRepo.delete(this._orderDirectory, userId, function(error){
        callback(error)
    })
}

module.exports = lib
