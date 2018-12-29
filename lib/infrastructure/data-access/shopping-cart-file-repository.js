const dataRepo = require('./data-file-repository')
let shoppingCartModel = require('../../domain/shopping-cart-model')
let menuItemModel = require('../../domain/menu-item-model')

// Container for the library to be exported
var lib = {}

lib._cartDirectory = 'shoppingCarts'

lib.create = function(userId, cartData, callback){
    dataRepo.create(lib._cartDirectory, userId, cartData, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._cartDirectory, id, function(error, cartData){
        if(!error && cartData){
            let menuItems = [];
            cartData.menuItems.forEach(mi => {
                let menuItem = new menuItemModel(mi.name, mi.description, mi.price, mi.userId)
                menuItems.push(menuItem)

                if(cartData.menuItems.length == menuItems.length){
                    let shoppingCart = new shoppingCartModel(menuItems, id)
                    callback(error, shoppingCart)
                }
            })
        }
        else{
            callback(error, cartData)
        }
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
