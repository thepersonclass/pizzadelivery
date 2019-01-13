/*
* The shopping cart file repository creates, reads, deletes, and updates shopping carts on the file system
*/

// Dependancies
const dataRepo = require('./data-file-repository')
let shoppingCartModel = require('../../domain/shopping-cart-model')
let menuItemModel = require('../../domain/menu-item-model')

// Container for the library to be exported
var lib = {}

lib._cartDirectory = 'shoppingCarts'

/**
 * Creates a shopping cart on the file system
 * @param {string} userId - User Id.
 * @param {shoppingCartModel} cartData - The ShoppingCartModel object.
 * @param {function} callback - Error callback function.
 */
lib.create = function(userId, cartData, callback){
    dataRepo.create(lib._cartDirectory, userId, cartData, function(error){
        callback(error)
    })
}

/**
 * Read the shopping cart from the file system
 * @param {string} id - The order id.
 * @param {function} callback - Error callback function.
 */
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
 * Updates a shopping cart on the file system
 * @param {string} id - The order id.
 * @param {shoppingCartModel} cartData - The ShoppingCartModel object.
 * @param {function} callback - Error callback function.
 */
lib.update = function(id, cart, callback){
    dataRepo.update(lib._cartDirectory, id, cart, function(error){
        callback(error)
    })
}

/**
 * Deletes the shopping cart from the file system
 * @param {string} id - The order id.
 * @param {function} callback - Error callback function.
 */
lib.delete = function(id, callback){
    dataRepo.delete(this._cartDirectory, id, function(error){
        callback(error)
    })
}

module.exports = lib
