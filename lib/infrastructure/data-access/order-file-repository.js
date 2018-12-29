const dataRepo = require('./data-file-repository')
let orderModel = require('../../domain/order-model')
let creditCardModel = require('../../domain/credit-card-model')
let shoppingCartModel = require('../../domain/shopping-cart-model')
let menuItemModel = require('../../domain/menu-item-model')

// Container for the library to be exported
var lib = {}

lib._orderDirectory = 'orders'

lib.create = function(order, callback){
    dataRepo.create(lib._orderDirectory, order.id, order, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._orderDirectory, id, function(error, orderData){
        if(!error && orderData){
            let creditCard = new creditCardModel(orderData.creditCard.creditCardNumber, orderData.creditCard.expirationDate, orderData.creditCard.ccv)
            let menuItems = [];
            orderData.shoppingCart.menuItems.forEach(mi => {
                let menuItem = new menuItemModel(mi.name, mi.description, mi.price, mi.userId)
                menuItems.push(menuItem)

                if(orderData.shoppingCart.menuItems.length == menuItems.length){
                    let shoppingCart = new shoppingCartModel(menuItems, orderData.shoppingCart.userId)
                    let order = new orderModel(orderData.id, orderData.userId, creditCard, shoppingCart)
        
                    callback(error, order)
                }
            })
        }
        else{
            callback(error, order)
        }
    })
}

module.exports = lib;
