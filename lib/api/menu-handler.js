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
    const name = typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false
    const price = typeof (data.payload.price) == 'number' ? data.payload.price : false
    const description = typeof (data.payload.description) == 'string' && data.payload.description.trim().length > 0 ? data.payload.description.trim() : false

    if (name && price && description) {
        //Create the menu object
        let menuData = {
            'name': name,
            'description': description,
            'price': price
        }

        menuDataRepository.create(menuData, function(error){
            if(!error){
                callback(201, menuData)
            }
            else{
                callback(500, {'Error':'There was an issue creating menu item'})
            }
        });
    }
    else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

handlers.get = function (data, callback) {
    // Check that the id provided is valid
    let id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (id) {
        menuDataRepository.read(id, function (error, menuData) {
            if (!error && menuData) {
                callback(200, menuData)
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
        menuDataRepository.read(id, function (error, menuData) {
            if (!error && menuData) {
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
        // Lookup the menu item
        menuDataRepository.read(id, function (error, menuData) {
            if (!error && menuData) {
                const name = typeof(data.payload.name) === 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false
                const description = typeof(data.payload.description) === 'string' && data.payload.description.trim().length > 0 ? data.payload.description : false
                const price = typeof(data.payload.price) === 'number' ? data.payload.price : false

                if (name || description || price) {
                    // Update fields
                    if (name) {
                        menuData.name = name
                    }
                    if (description) {
                        menuData.description = description
                    }
                    if (price) {
                        menuData.price = price
                    }
                }
                else {
                    callback(400, { 'error': 'Missing field to update' })
                }
                
                // Store new updates
                menuDataRepository.update(id, menuData, function (error) {
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
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

module.exports = handlers