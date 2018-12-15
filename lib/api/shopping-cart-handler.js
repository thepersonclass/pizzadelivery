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
    const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
    const userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length > 0 ? data.queryStringObject.userId.trim() : false

    if (menuItemIds && userId){
        //Validate all menu items submitted
        shoppingCartDataRepository.read(userId, function(error, previousCartData){
            if(error){
                menuDataRepository.isValidMenuItems(menuItemIds, function(error, validMenuItems){
                    if(!error){
                        //Create the shopping cart
                        let cartData = {
                            'menuItems': validMenuItems
                        }

                        shoppingCartDataRepository.create(userId, cartData, function(error){
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
                })
            }
            else {
                callback(400, "Cart already exists, use put to update cart")
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
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if(id) {
        // Lookup the shopping cart item
        shoppingCartDataRepository.read(id, function (error, previousCartData) {
            if (!error && previousCartData) {
                const menuItemIds = typeof(data.payload.menuItems) == 'object' && data.payload.menuItems instanceof Array ? data.payload.menuItems : false
                if (menuItemIds) {
                    let menuItems = []
                    menuItemIds.forEach(menuItemId => {
                        menuDataRepository.read(menuItemId, (error, menuItemData) => {
                            if(!error){
                                delete menuItemData.description
                                menuItems.push(menuItemData)
                            }

                            // Update fields if we have looked up all menu items
                            if(menuItems.length == menuItemIds.length){
                                //Overwrite items with the items given
                                previousCartData.menuItems = menuItems

                                // Store new updates
                                shoppingCartDataRepository.update(id, previousCartData, function (error) {
                                    if (!error) {
                                        callback(200)
                                    }
                                    else {
                                        callback(500, { 'error': 'Could not update cart' })
                                    }
                                });
                            }
                        })
                    });
                }
                else {
                    callback(400, { 'error': 'Missing field to update' })
                }
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