let shoppingCartModel = require('./shopping-cart-model')
let creditCardModel = require('./credit-card-model')
const helpers = require('../helpers')

class OrderModel {
    constructor(id, userId, creditCard, shoppingCart){
        const validId = typeof(id) == 'string' && id.trim().length == 10 ? id.trim() : helpers.createRandomString(10)
        const validUserId = typeof(userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false
        const validCreditCard = creditCard instanceof creditCardModel ? creditCard : false
        const validShoppingCart = shoppingCart instanceof shoppingCartModel ? shoppingCart : false

        if(validId, validUserId, validCreditCard, validShoppingCart){
            this.userId = validUserId
            this.creditCard = validCreditCard
            this.shoppingCart = validShoppingCart
            this.id = validId
        }
    }
}

module.exports = OrderModel