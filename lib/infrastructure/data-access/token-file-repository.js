/*
* The token file repository creates, reads, and deletes tokens on the file system
*/

// Dependancies
const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._tokenDirectory = 'tokens'

/**
 * Creates a token on the file system
 * @param {string} userId - User Id.
 * @param {function} callback - Error callback function.
 */
lib.create = function(userId, callback){
    let token = {
        'id': userId,
        'tokenId': helpers.createRandomString(20),
        'expires':  Date.now() + 1000 * 60 * 60
    }

    dataRepo.create(lib._tokenDirectory, token.tokenId, token, function(error){
        callback(error, token)
    })
}

/**
 * Read the token from the file system
 * @param {string} tokenId - Token Id.
 * @param {function} callback - Error callback function.
 */
lib.read = function(tokenId, callback){
    dataRepo.read(lib._tokenDirectory, tokenId, function(error, token){
        callback(error, token)
    })
}

/**
 * Extends the token expiration on the file system if it hasn't expired
 * @param {string} tokenId - Token Id.
 * @param {function} callback - Error callback function.
 */
lib.update = function(tokenId, callback){
    dataRepo.read(lib._tokenDirectory, tokenId, function(error, token){
        if(!error){
            if (token.expires > Date.now()) {
                const expires = Date.now() + 1000 * 60 * 60;
                token.expires = expires;
                dataRepo.update(lib._tokenDirectory, tokenId, token, function (updateError) {
                    if (!updateError) {
                        callback(updateError);
                    }
                    else {
                        callback(updateError);
                    }
                })
            }
        }
        else{
            callback(error)
        }
    })                  
}

/**
 * Deletes the token from the file system
 * @param {string} tokenId - Token Id.
 * @param {function} callback - Error callback function.
 */
lib.delete = function(tokenId, callback){
    dataRepo.delete(this._tokenDirectory, tokenId, function(error){
        callback(error)
    })
}

/**
 * Verifies if a token belongs to the given user
 * @param {string} tokenId - Token Id.
 * @param {string} userId - User Id.
 * @param {function} callback - Error callback function.
 */
lib.tokenBelongsToUser = function(tokenId, userId, callback){
    lib.read(tokenId, function(error, token){
        if(!error){
            if(token.id == userId){
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
