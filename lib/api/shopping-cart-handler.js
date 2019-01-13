/*
* The shopping cart handler gives the user the ability to add, remove, update, or view menu items in there shopping cart
*/

// Dependancies
const shoppingCartDataRepository = require('../infrastructure/data-access/shopping-cart-file-repository')
const menuDataRepository = require('../infrastructure/data-access/menu-file-repository')
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

// Shopping Cart - Create
// Required - Menu Item Id(s), user id, valid user auth token in header
// Optional = none
handlers.post = function (data, callback) {
    //Validation
    const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
    const userId = data.queryStringObject.userId
    const tokenId = data.headers.token

    if (menuItemIds && userId && tokenId){
        // Since any authenticated user can add menu items to there shopping cart we only check to see if the token expired
        tokenHandler.checkExpiration(tokenId, function(tokenError){
            if(!tokenError){
                //Verify all menu item ids given are valid
                menuDataRepository.areValidMenuItems(menuItemIds, function(error, validMenuItems){
                    if(!error){
                        //Create the shopping cart
                        let shoppingCart = new shoppingCartModel(validMenuItems, userId)
                        //Write shopping cart to repository
                        shoppingCartDataRepository.create(userId, shoppingCart, function(error){
                            if(!error){
                                callback(201, shoppingCart)
                            }
                            else{
                                callback(500, {'Error':'There was an issue creating the cart'})
                            }
                        })
                    }
                    else{
                        callback(400, {'Error':'A invalid menu item was submitted'})
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

// Shopping Cart - Get
// Required - Shopping cart id, valid user auth token in header
// Optional = none
handlers.get = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = data.headers.token
    
    if (id && tokenId) {
        //Read user's shopping cart
        shoppingCartDataRepository.read(id, function (error, shoppingCart) {
            if(!error && shoppingCart){
                //Verify that the given token belongs to the given user and that its a valid token
                tokenHandler.verifyToken(tokenId, shoppingCart.userId, function(isValidToken){
                    if(isValidToken){
                        callback(200, shoppingCart)
                    }
                    else{
                        callback(401, {'Error':'Not Authorized'})
                    }
                })
            }
            else{
                callback(404, {'message':'Shopping cart was not found'})
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }

}

// Shopping Cart - Delete
// Required - Shopping cart id, valid user auth token in header
// Optional = none
handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = data.headers.token

    if (id && tokenId) {
        //Read user's shopping cart
        shoppingCartDataRepository.read(id, function (error, shoppingCart) {
            if(!error && shoppingCart){
                //Verify that the given token belongs to the given user and that its a valid token
                tokenHandler.verifyToken(tokenId, shoppingCart.userId, function(isValidToken){
                    if(isValidToken){
                        // Delete the menu item
                        shoppingCartDataRepository.delete(id, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'There was an issue deleting the shopping cart' })
                            }
                        })
                    }
                    else{
                        callback(401, {'Error':'Not Authorized'})
                    }
                })
            }
            else {
                callback(404, {'message':'Shopping cart was not found'})
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

// Shopping Cart - Update
// Required - Shopping cart id, valid user auth token in header
// Optional = none
handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
    const tokenId = data.headers.token

    if(id && tokenId && menuItemIds) {
        // Lookup the shopping cart item
        shoppingCartDataRepository.read(id, function (error, previousShoppingCart) {
            if(!error && previousShoppingCart){
                //Verify that the given token belongs to the given user and that its a valid token
                tokenHandler.verifyToken(tokenId, previousShoppingCart.userId, function(isValidToken){
                    if(isValidToken){
                            //Verify all menu item ids given are valid
                            menuDataRepository.areValidMenuItems(menuItemIds, function(menuItemErrors, validMenuItems){
                                if(!menuItemErrors){
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
                                    })
                                }
                            })
                    }
                    else{
                        callback(401, {'Error':'Not Authorized'})
                    }
                })
            }
            else {
                callback(404, {'message':'Shopping cart was not found'})
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

module.exports = handlers