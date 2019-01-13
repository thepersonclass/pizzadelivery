/*
* The menu handler gives the user the ability to administer the resteraunt's menu. An authenticated user can create, view, delete, and
* update the resteraunt's menu items.
*/

// Dependancies
const menuDataRepository = require('../infrastructure/data-access/menu-file-repository')
const menuItemModel = require('../domain/menu-item-model')
const tokenHandler = require('./token-handler')

// Define handlers
let handlers = {}

// Menu handler
handlers = function (data, callback) {
    const acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
}

// Menu Item - Create
// Required - Name, price, description, userId, and valid user auth token in header
// Optional = none
handlers.post = function (data, callback) {
    //Get data from payload
    let name = data.payload.name
    let price = data.payload.price
    let description = data.payload.description
    let userId = data.queryStringObject.userId
    let tokenId = data.headers.token

    //Create the menu object
    let menuItem = new menuItemModel(name, description, price, userId)

    //Verify all required data is present
    if (menuItem.name && menuItem.price && menuItem.description && tokenId) {
        // Since any authenticated user can update menu items (there should authorization here) we only check to see if the token expired
        tokenHandler.checkExpiration(tokenId, function(tokenError){
            if(!tokenError){  
                menuDataRepository.create(menuItem, function(error){
                    if(!error){
                        callback(201, menuItem)
                    }
                    else{
                        callback(500, {'Error':'There was an issue creating menu item'})
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

// Menu Item - Get
// Required - Menu Data, Valid auth token in header
// Optional = none
handlers.get = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = data.headers.token

    if (id && tokenId) {
        // Since any authenticated user can update menu items (there should authorization here) we only check to see if the token expired
        tokenHandler.checkExpiration(tokenId, function(tokenError){
            if(!tokenError){
                //Read menu item
                menuDataRepository.read(id, function (error, menuItem) {
                    if (!error && menuItem) {
                        callback(200, menuItem)
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

// Menu Item - Delete
// Required - Menu Data, Valid auth token in header
// Optional = none
handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = data.headers.token

    if (id && tokenId) {        
        // Since any authenticated user can update menu items (there should authorization here) we only check to see if the token expired
        tokenHandler.checkExpiration(tokenId, function(tokenError){
            if(!tokenError){
                menuDataRepository.read(id, function (error, menuItem) {
                    if (!error && menuItem) {
                        // Delete the menu item
                        menuDataRepository.delete(id, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'There was an issue deleting the menu item' })
                            }
                        })
                    }
                    else {
                        callback(404, {'message':'Menu item was not found'})
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

// Menu Item - Update
// Required - Menu Data, Valid auth token in header
// Optional = none
handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = data.headers.token

    if (id && tokenId) { 
        // Since any authenticated user can update menu items (there should authorization here) we only check to see if the token expired
        tokenHandler.checkExpiration(tokenId, function(tokenError){
            if(!tokenError){
                // Lookup the menu item
                menuDataRepository.read(id, function (error, menuItem) {
                    if (!error && menuItem) {
                        // Read the update from payload
                        const name = data.payload.name
                        const description = data.payload.description
                        const price = data.payload.price

                        // Create menu item object
                        const updatedMenuItem = new menuItemModel(name, description, price)

                        //Verify that there is at least value to update
                        if (updatedMenuItem.name || updatedMenuItem.description || updatedMenuItem.price) {
                            // Update fields
                            if (updatedMenuItem.name) {
                                menuItem.name = updatedMenuItem.name
                            }
                            if (updatedMenuItem.description) {
                                menuItem.description = updatedMenuItem.description
                            }
                            if (updatedMenuItem.price) {
                                menuItem.price = updatedMenuItem.price
                            }
                        }
                        else {
                            callback(400, { 'error': 'Missing field to update' })
                        }
                        
                        // Store new updates
                        menuDataRepository.update(id, updatedMenuItem, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'Could not update menu item' })
                            }
                        })
                    }
                    else {
                        callback(400, 'Menu item is not found')
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