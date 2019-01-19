/*
* The order handler gives the user the ability to create or view a previous order
*/

// Dependancies
const shoppingCartDataRepository = require('../infrastructure/data-access/shopping-cart-file-repository')
const userDataRepository = require('../infrastructure/data-access/user-file-repository')
const orderDataRepository = require('../infrastructure/data-access/order-file-repository')
const tokenHandler = require('./token-handler')
const mailgun = require('../infrastructure/email/mailgun')
const stripe = require('../infrastructure/payment-processing/stripe')
let orderModel = require('../domain/order-model')

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

// Order - Create
// Required - Shopping cart id, payment token, user id, valid user auth token in header
// Optional = none
handlers.post = function (data, callback) {
    //Validation
    const cartId = typeof(data.payload.cartId) == 'string' && data.payload.cartId.trim().length == 10 ? data.payload.cartId.trim() : helpers.createRandomString(10)
    const userId = typeof(data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 10 ? data.queryStringObject.userId.trim() : false
    const paymentToken = typeof(data.payload.paymentToken) == 'string' && data.payload.paymentToken.trim().length > 0 ? data.payload.paymentToken.trim() : false
    const tokenId = data.headers.token

    //Verify all required data is present
    if (cartId && paymentToken && userId && tokenId){
        //Verify that the given token belongs to the given user and that its a valid token
        tokenHandler.verifyToken(tokenId, userId, function(isValidToken){
            if(isValidToken){
                //First get user information
                userDataRepository.read(userId, function(error, userData){
                    if(!error && userData){
                        //Read menu items from shopping cart
                        shoppingCartDataRepository.read(cartId, function(error, shoppingCart){
                            if(!error && shoppingCart){

                                //Create order object
                                const order = new orderModel("", userId, paymentToken, shoppingCart)

                                //Store new order
                                orderDataRepository.create(order, function(error){
                                    if(!error){
                                        
                                        //Charge order
                                        stripe.charge(order, function(error){
                                            if(!error){

                                                //Email order reciept to customer
                                                mailgun.send(order, function(error){
                                                    if(!error){
                                                        callback(201, order)
                                                    }
                                                    else{
                                                        callback(500, {'Error': 'There was an issue sending the reciept'})
                                                    }
                                                })
                                            }
                                            else{
                                                callback(500, {'Error': 'There was an issue charging the order'})
                                            }
                                        })
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

// Order - Get
// Required - Order id, valid user auth token in header
// Optional = none
handlers.get = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const userId = typeof(data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 10 ? data.queryStringObject.userId.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (id && tokenId && userId) {
        //Verify that the given token belongs to the given user and that its a valid token
        tokenHandler.verifyToken(tokenId, userId, function(isValidToken){
            if(isValidToken){
                //Read order
                orderDataRepository.read(id, function (error, order) {
                    if (!error && order) {
                        callback(200, order)
                    }
                    else {
                        callback(404)
                    }
                })
            }
            else{
                callback(401, {'Error':'Not Authorized'})
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }

}

module.exports = handlers