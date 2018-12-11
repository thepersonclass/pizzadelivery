const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._userDirectory = 'users'

lib.create = function(user, callback){
    user.id = helpers.createRandomString(10)
    dataRepo.create(lib._userDirectory, user.id, user, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._userDirectory, id, function(error, userData){
        callback(error, userData)
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The user's Id.
 */
lib.update = function(id, user, callback){
    dataRepo.update(lib._userDirectory, id, user, function(error){
        callback(error)
    })
}

lib.delete = function(id, callback){
    dataRepo.delete(this._userDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib
