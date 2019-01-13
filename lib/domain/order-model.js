/*
* Order Model
*/

// Dependancies
let shoppingCartModel = require('./shopping-cart-model')
const helpers = require('../helpers')

//Required: order Id, user Id, stripe payment token, and the shopping cart
//Optional: None
class OrderModel {
    constructor(id, userId, stripePaymentToken, shoppingCart){
        const validId = typeof(id) == 'string' && id.trim().length == 10 ? id.trim() : helpers.createRandomString(10)
        const validUserId = typeof(userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false
        const validStripePaymentToken = typeof(stripePaymentToken) == 'string' && stripePaymentToken.trim().length > 0 ? stripePaymentToken.trim() : false
        const validShoppingCart = shoppingCart instanceof shoppingCartModel ? shoppingCart : false

        if(validId, validUserId, validStripePaymentToken, validShoppingCart){
            this.userId = validUserId
            this.stripePaymentToken = validStripePaymentToken
            this.shoppingCart = validShoppingCart
            this.id = validId
        }
    }
}

module.exports = OrderModel