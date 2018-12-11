const dataRepo = require('./data-file-repository')

// Container for the library to be exported
var lib = {}

lib._cartDirectory = 'shoppingcarts'

lib.create = function(cart, callback){
    dataRepo.create(lib._cartDirectory, cart.id, menuItem, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._cartDirectory, id, function(error, userData){
        callback(error, userData)
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The order Id.
 */
lib.update = function(id, cart, callback){
    dataRepo.update(lib._cartDirectory, id, cart, function(error){
        callback(error)
    })
}

lib.delete = function(id, callback){
    dataRepo.delete(this._cartDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib
