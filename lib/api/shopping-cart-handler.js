const shoppingCartDataRepository = require('../infrastructure/data-access/shopping-cart-file-repository')
const menuDataRepository = require('../infrastructure/data-access/menu-file-repository')

// Define handlers
let handlers = {}

// Menu handler
handlers = function (data, callback) {
    var acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
}

handlers.post = function (data, callback) {
    //Validation
    const menuItems = typeof (data.payload.menuItems) == Array && data.payload.menuItems.length > 0 ? data.payload.menuItems : false
    const userId = typeof (data.payload.userId) == 'string' && data.payload.userId.trim().length > 0 ? data.payload.userId.trim() : false

    if (menuItems && userId){
        //Validate all menu items submitted
        let menuItemsAreValid = true;
        menuItems.array.forEach(menuItem => {
            menuDataRepository.read(menuItem.id, (error, menuData) => {
                if(error){
                    menuItemsAreValid = false
                }
            })
        })

        if(menuItemsAreValid){
            //Create the shopping cart
            let cartData = {
                'menuItems': menuItems,
                'userId': userId
            }

            shoppingCartDataRepository.create(cartData, function(error){
                if(!error){
                    callback(201, cartData)
                }
                else{
                    callback(500, {'Error':'There was an issue creating the cart'})
                }
            });
        }
        else{
            callback(400, {'Error':'A invalid menu item was submitted'})
        }
        
    }
    else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

handlers.get = function (data, callback) {
    // Check that the id provided is valid
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (id) {
        shoppingCartDataRepository.read(id, function (error, cartData) {
            if (!error && cartData) {
                callback(200, cartData)
            }
            else {
                callback(404)
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }

}

handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (id) {
        shoppingCartDataRepository.read(id, function (error, cartData) {
            if (!error && cartData) {
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
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (id) {
        // Lookup the shopping cart item
        shoppingCartDataRepository.read(id, function (error, cartData) {
            if (!error && cartData) {
                const cartData = typeof (data.payload.cartData) == Array && data.payload.cartData.length > 0 ? data.payload.cartData : false

                if (cartData) {
                    // Update fields
                    cartData.menuItems = menuItems
                }
                else {
                    callback(400, { 'error': 'Missing field to update' })
                }
                
                // Store new updates
                shoppingCartDataRepository.update(id, cartData, function (error) {
                    if (!error) {
                        callback(200)
                    }
                    else {
                        callback(500, { 'error': 'Could not update cart' })
                    }
                });
            }
            else {
                callback(400, 'Cart is not found')
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

module.exports = handlers