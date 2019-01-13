/*
* The user file repository creates, reads, and deletes users on the file system
*/

// Dependancies
const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._userDirectory = 'users'

/**
 * Creates a user on the file system
 * @param {userModel} user - The user model object.
 * @param {function} callback - Error callback function.
 */
lib.create = function(user, callback){
    user.id = helpers.createRandomString(10)
    dataRepo.create(lib._userDirectory, user.id, user, function(error){
        callback(error)
    })
}

/**
 * Read the user from the file system
 * @param {string} id - User Id.
 * @param {function} callback - Error callback function.
 */
lib.read = function(id, callback){
    dataRepo.read(lib._userDirectory, id, function(error, userData){
        callback(error, userData)
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The user's Id.
 * @param {userModel} user - The user model object.
 */
lib.update = function(id, user, callback){
    dataRepo.update(lib._userDirectory, id, user, function(error){
        callback(error)
    })
}

/**
 * Delete the user from the file system
 * @param {string} id - User Id.
 * @param {function} callback - Error callback function.
 */
lib.delete = function(id, callback){
    dataRepo.delete(this._userDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib
