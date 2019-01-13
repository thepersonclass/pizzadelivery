/*
* Mailgun email sender
*/

// Dependancies
const userRepository = require('../data-access/user-file-repository')
const https = require('https')
const querystring = require('querystring')
const config = require('../../config')

let mailgun = {}

mailgun.send = function(order, callback){
    //Read user's information
    userRepository.read(order.userId, function(error, user){
        if(!error && user){

            //Create menu item table rows in html
            let menuItems = ""
            order.shoppingCart.menuItems.forEach(menuItem => {
                menuItems += `<tr><td><b>${menuItem.name}</b><br/>${menuItem.description}</td><td>${menuItem.price}</td></tr>`
            })

            //Prepare email html template
            var post_data = querystring.stringify({
                'to' : `${user.firstName} ${user.lastname} <${user.email}>`,
                'from': 'Pizza Delivery <pizzadelivery@gmail.com>',
                'subject': 'Your pizza is on its way',
                'html' : `<html>
                <h1>Order Summary</h1>
                <table>
                ${menuItems}
                <tr>
                    <td style="padding-top: 10px">Total</td><td style="padding-top: 10px">${order.total}</td>
                 </tr>
                </table>
                </html>`
            })
            
            //Prepare auth token
            const credentials = "api" + ":" + config.mailGunKey
            const base64Credentials = Buffer.from(credentials).toString('base64')
            const authBearerToken = `Bearer ${base64Credentials}`

            //Order mail request options
            const options = {
                method: "POST",
                hostname: "api.mailgun.net",
                port: 443,
                path: "/v3/sandbox8b7c7e4d48954983ba7745a7aeb0402a.mailgun.org/messages",
                headers: {
                    "Authorization": authBearerToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(post_data)
                }
            }

            //Http webrequest to mailgun
            let req = https.request(options, (res) => {
                res.setEncoding('utf8')
              
                res.on('data', (d) => {
                  callback(false)
                })
            })

            req.on('error', (e) => {
                callback(e)
            })

            req.write(post_data)
            req.end()
        }
        else{
            callback(error)
        }
    })
}

module.exports = mailgun