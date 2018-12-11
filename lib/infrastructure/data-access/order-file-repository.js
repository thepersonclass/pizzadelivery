const dataRepo = require('./data-file-repository')

// Container for the library to be exported
var lib = {}

lib._orderDirectory = 'orders'

lib.create = function(order, callback){
    dataRepo.create(lib._orderDirectory, order.id, menuItem, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._orderDirectory, id, function(error, userData){
        callback(error, userData)
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The order Id.
 */
lib.update = function(id, order, callback){
    dataRepo.update(lib._orderDirectory, id, order, function(error){
        callback(error)
    })
}

lib.delete = function(id, callback){
    dataRepo.delete(this._orderDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib;
