const userDataRepository = require('../infrastructure/data-access/user-file-repository')
const helpers = require('../helpers')

// Define handlers
var handlers = {}

// Users handler
handlers = function (data, callback) {
    var acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
}

// Users - Post
// Required Data: firstname, lastname, phone, password, tosAgreement
// Optional Data: none
handlers.post = function (data, callback) {
    //Validation
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false
    const email = typeof (data.payload.email) == 'string' ? data.payload.email.trim() : false
    const streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if (firstName && lastName && email && streetAddress && password && tosAgreement) {
        // Hash password
        var hashedPassword = helpers.hash(password)
        if (hashedPassword) {
            //Create the users object
            var userObject = {
                'id': helpers.createRandomString(10),
                'firstName': firstName,
                'lastName': lastName,
                'email': email,
                'streetAddress': streetAddress,
                'password': hashedPassword,
                'tosAgreement': tosAgreement
            }

            userDataRepository.create(userObject, function(error){
                if(!error){
                    delete userObject.hashedPassword
                    callback(201, userObject)
                }
                else{
                    callback(500, {'Error':'There was an issue creating user'})
                }
            });
        }
        else {
            callback(500, { 'error': 'Issue hashing password' })
        }
    }
    else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

// Users - Get
// Required Data: Id
// Optional Data: None
handlers.get = function (data, callback) {
    // Check that the id provided is valid
    console.log(typeof (data.queryStringObject.id))
    var userId = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false;
    if (userId) {
        userDataRepository.read(userId, function (error, userData) {
            if (!error && userData) {
                // Remove user password before returning to user
                delete userData.hashedPassword
                callback(200, userData)
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

// Users - Delete
// Required Data: id
// Optional Data: None
handlers.delete = function (data, callback) {
    // Check that the id provided is valid
    const userId = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (userId) {
        userDataRepository.read(userId, function (error, userData) {
            if (!error && userData) {
                // Delete the user
                userDataRepository.delete(userId, function (error) {
                    if (!error) {
                        callback(200)
                    }
                    else {
                        callback(500, { 'error': 'There was an issue deleting the user' })
                    }
                });
            }
            else {
                callback(404, {'message':'User was not found'})
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

// Users - Put
// Required - id
// Optional - firstName, lastName, password at least one should be specified
handlers.put = function (data, callback) {
    // Check that the id provided is valid
    const userId = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false
    if (userId) {
        // Lookup the user
        userDataRepository.read(userId, function (error, userData) {
            if (!error && userData) {
                var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false
                var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false
                var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false
                var email = typeof (data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false
                var streetAddress = typeof (data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false

                if (firstName || lastName || password) {
                    // Update fields
                    if (firstName) {
                        userData.firstName = firstName
                    }
                    if (lastName) {
                        userData.lastName = lastName
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password)
                    }
                    if (streetAddress) {
                        userData.streetAddress = streetAddress
                    }
                    if (email) {
                        userData.email = email
                    }
                }
                else {
                    callback(400, { 'error': 'Missing field to update' })
                }
                
                // Store new updates
                userDataRepository.update(userId, userData, function (error) {
                    if (!error) {
                        callback(200)
                    }
                    else {
                        callback(500, { 'error': 'Could not update user' })
                    }
                });
            }
            else {
                callback(400, 'User is not found')
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

module.exports = handlers;