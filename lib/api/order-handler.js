const shoppingCartDataRepository = require('../infrastructure/data-access/shopping-cart-file-repository')
const userDataRepository = require('../infrastructure/data-access/user-file-repository')
const orderDataRepository = require('../infrastructure/data-access/order-file-repository')
const tokenRepository = require('../infrastructure/data-access/token-file-repository')
const tokenHandler = require('./token-handler')
let orderModel = require('../domain/order-model')
let creditCardModel = require('../domain/credit-card-model')

// Define handlers
let handlers = {}

// Order handler
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
    const cartId = data.payload.cartId.trim()
    const creditCardNumber = data.payload.creditCardNumber
    const expirationDate = data.payload.expirationDate
    const ccv = data.payload.ccv
    const userId = data.queryStringObject.userId.trim()
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (cartId && creditCardNumber && userId && expirationDate && ccv && tokenId){
        tokenHandler.verifyToken(tokenId, userId, function(isValidToken){
            if(isValidToken){
                //First get user information
                userDataRepository.read(userId, function(error, userData){
                    if(!error && userData){
                        shoppingCartDataRepository.read(cartId, function(error, shoppingCart){
                            if(!error && shoppingCart){
                                //Create the order

                                let creditCard = new creditCardModel(creditCardNumber, expirationDate, ccv)
                                let order = new orderModel(null, userData.id,  creditCard, shoppingCart)

                                orderDataRepository.create(order, function(error){
                                    if(!error){
                                        callback(201, order)
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
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (id && tokenId) {
        orderDataRepository.read(id, function (error, order) {
            tokenRepository.tokenBelongsToUser(tokenId, order.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error && order) {
                        callback(200, order)
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

module.exports = handlers