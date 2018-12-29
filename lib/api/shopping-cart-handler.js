const shoppingCartDataRepository = require('../infrastructure/data-access/shopping-cart-file-repository')
const menuDataRepository = require('../infrastructure/data-access/menu-file-repository')
const tokenRepository = require('../infrastructure/data-access/token-file-repository')
const tokenHandler = require('./token-handler')
let shoppingCartModel = require('../domain/shopping-cart-model')

// Define handlers
let handlers = {}

// Shopping cart handler
handlers = function (data, callback) {
    const acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
}

handlers.post = function (data, callback) {
    //Validation
    const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
    const userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length > 0 ? data.queryStringObject.userId.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if (menuItemIds && userId && tokenId){
        tokenHandler.verifyToken(tokenId, userId, function(isValidToken){
            if(isValidToken){
                //Validate all menu items submitted
                shoppingCartDataRepository.read(userId, function(error, previousCart){
                    if(error){
                        menuDataRepository.isValidMenuItems(menuItemIds, function(error, validMenuItems){
                            console.log()
                            if(!error){
                                //Create the shopping cart
                                let shoppingCart = new shoppingCartModel(validMenuItems, userId)

                                shoppingCartDataRepository.create(userId, shoppingCart, function(error){
                                    if(!error){
                                        callback(201, shoppingCart)
                                    }
                                    else{
                                        callback(500, {'Error':'There was an issue creating the cart'})
                                    }
                                });
                            }
                            else{
                                callback(400, {'Error':'A invalid menu item was submitted'})
                            }
                        })
                    }
                    else {
                        callback(400, "Cart already exists, use put to update cart")
                    }
                })   
            }
            else{
                callback(401, {'Error':'Not Authorized'})
            }
        })
    }
    else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

handlers.get = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if (id && tokenId) {
        shoppingCartDataRepository.read(id, function (error, shoppingCart) {
            console.log(shoppingCart.userId)
            tokenRepository.tokenBelongsToUser(tokenId, shoppingCart.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error && shoppingCart) {
                        callback(200, shoppingCart)
                    }
                    else {
                        callback(404)
                    }
                }
                else{
                    callback(401, {'Error':'Not Authorized'})
                }
            })
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }

}

handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if (id && tokenId) {
        shoppingCartDataRepository.read(id, function (error, shoppingCart) {
            tokenRepository.tokenBelongsToUser(tokenId, shoppingCart.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error) {
                        // Delete the menu item
                        shoppingCartDataRepository.delete(id, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'There was an issue deleting the shopping cart' })
                            }
                        });
                    }
                    else {
                        callback(404, {'message':'Shopping cart was not found'})
                    }
                }
                else{
                    callback(401, {'Error':'Not Authorized'})
                }
            })
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if(id && tokenId) {
        // Lookup the shopping cart item
        shoppingCartDataRepository.read(id, function (error, previousShoppingCart) {
            tokenRepository.tokenBelongsToUser(tokenId, previousShoppingCart.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error && previousShoppingCart) {
                        const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
                        if (menuItemIds) {
                            menuDataRepository.isValidMenuItems(menuItemIds, function(error, validMenuItems){
                                if(!error){
                                        //Overwrite items with the items given
                                        let shoppingCart = new shoppingCartModel(validMenuItems, id)

                                        // Store new updates
                                        shoppingCartDataRepository.update(id, shoppingCart, function (error) {
                                            if (!error) {
                                                callback(200)
                                            }
                                            else {
                                                callback(500, { 'error': 'Could not update cart' })
                                            }
                                        });
                                }
                            });
                        }
                        else {
                            callback(400, { 'error': 'Missing field to update' })
                        }
                    }
                    else {
                        callback(400, 'Cart is not found')
                    }
                }
                else{
                    callback(401, {'Error':'Not Authorized'})
                }
            })
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

module.exports = handlers