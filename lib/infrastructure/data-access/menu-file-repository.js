const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')

// Container for the library to be exported
var lib = {}

lib._menuDirectory = 'menu'

lib.create = function(menuItem, callback){
    menuItem.id = helpers.createRandomString(10)

    dataRepo.create(lib._menuDirectory, menuItem.id, menuItem, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._menuDirectory, id, function(error, userData){
        callback(error, userData)
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The menu items's Id.
 */
lib.update = function(id, menuItem, callback){
    dataRepo.update(lib._menuDirectory, id, menuItem, function(error){
        callback(error)
    })
}

lib.delete = function(id, callback){
    dataRepo.delete(this._menuDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib
