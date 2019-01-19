/*
* Stripe payment processor
*/

// Dependancies
const https = require('https')
const config = require('../../config')
const querystring = require('querystring')

let stripe = {}

stripe.charge = function(order, callback){

    const authBearerToken = `Bearer ${config.stripeKey}`

    //Since the charge amount has to be in cents we multiple the total which is a decimal (23.00) by 100
    const chargeAmount = order.shoppingCart.total * 100

    //Prepare charge
    const post_data = querystring.stringify({
        'amount' : chargeAmount,
        'currency': 'usd',
        'source': `${order.stripePaymentToken}`,
        'description' : `${order.id}`
    })

    //Order stripe payment options
    const options = {
        method: "POST",
        hostname: "api.stripe.com",
        port: 443,
        path: "/v1/charges",
        headers: {
            "Authorization": authBearerToken,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }

    //Http webrequest to stripe
    let req = https.request(options, (res) => {
        res.setEncoding('utf8')
        
        res.on('data', (d) => {
            callback(false)
        })
    })

    req.on('error', (e) => {
        console.log(e)
        callback(e)
    })

    req.write(post_data)
    req.end()
}

module.exports = stripe