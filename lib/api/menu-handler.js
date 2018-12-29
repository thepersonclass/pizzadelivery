const menuDataRepository = require('../infrastructure/data-access/menu-file-repository')
const menuItemModel = require('../domain/menu-item-model')
const tokenHandler = require('./token-handler')
const tokenRepository = require('../infrastructure/data-access/token-file-repository')

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

handlers.post = function (data, callback) {
    let name = data.payload.name
    let price = data.payload.price
    let description = data.payload.description
    let userId = typeof (data.queryStringObject.userId) == 'string' && data.queryStringObject.userId.trim().length == 10 ? data.queryStringObject.userId.trim() : false
    let tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (name && price && description && tokenId) {
        tokenHandler.verifyToken(tokenId, userId, function(isValidToken){
            if(isValidToken){
                //Create the menu object
                let menuItem = new menuItemModel(name, description, price, userId)
        
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

handlers.get = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

    if (id && tokenId) {
        tokenRepository.read(tokenId, function(error, tokenData){
            if(!error){
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

handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if (id && tokenId) {
        menuDataRepository.read(id, function (error, menuItem) {
            tokenRepository.tokenBelongsToUser(tokenId, menuItem.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error && menuItem) {
                        // Delete the menu item
                        menuDataRepository.delete(id, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'There was an issue deleting the menu item' })
                            }
                        });
                    }
                    else {
                        callback(404, {'message':'Menu item was not found'})
                    }                }
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

handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    const tokenId = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false

    if (id && tokenId) {
        // Lookup the menu item
        menuDataRepository.read(id, function (error, menuItem) {
            tokenRepository.tokenBelongsToUser(tokenId, menuItem.userId, function(belongsToUser){
                if(belongsToUser){
                    if (!error && menuItem) {
                        const name = typeof(data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false
                        const description = typeof(data.payload.description) === 'string' && data.payload.description.trim().length > 0 ? data.payload.description : false
                        const price = typeof(data.payload.price) === 'number' ? data.payload.price : false

                        if (name || description || price) {
                            // Update fields
                            if (name) {
                                menuItem.name = name
                            }
                            if (description) {
                                menuItem.description = description
                            }
                            if (price) {
                                menuItem.price = price
                            }
                        }
                        else {
                            callback(400, { 'error': 'Missing field to update' })
                        }
                        
                        // Store new updates
                        menuDataRepository.update(id, menuItem, function (error) {
                            if (!error) {
                                callback(200)
                            }
                            else {
                                callback(500, { 'error': 'Could not update menu item' })
                            }
                        });
                    }
                    else {
                        callback(400, 'Menu item is not found')
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