/*
* Token handler gives the user token administration. A user can create, view, delete, extend tokens.
*/

// Dependancies
const tokenRepository = require('../infrastructure/data-access/token-file-repository')
const userRepository = require('../infrastructure/data-access/user-file-repository')
const helpers = require('../helpers')

// Define handlers
let handlers = {}

// Tokens handler
handlers = function (data, callback) {

    const acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
}

// Tokens - post
// Required - userId, password
// Optional - None
handlers.post = function (data, callback) {
    // Validation
    const userId = typeof (data.payload.userId) == 'string' && data.payload.userId.trim().length == 10 ? data.payload.userId.trim() : false
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false

    if (userId && password) {

        // Lookup the user
        userRepository.read(userId, function (error, usersData) {
            if (!error && usersData) {
                const hashedPassword = helpers.hash(password)
                //Verify password
                if (hashedPassword == usersData.password) {
                    //Create token
                    tokenRepository.create(userId, function (error, token) {
                        if (!error && token) {
                            callback(200, token)
                        }
                        else {
                            callback(500, { 'error': 'Could not create token' })
                        }
                    })
                }
                else {
                    callback(400, { 'error': 'Does not match password' })
                }
            }
            else {
                callback(400, { 'error': 'Could not find user' })
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field(s)' })
    }
}

// Tokens - Get
// Required: id
// Optional: none
handlers.get = function (data, callback) {
    // Check that the token provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

    if (id) {
        // Lookup the token
        tokenRepository.read(id, function (error, tokenData) {
            if (!error && tokenData) {
                callback(200, tokenData)
            }
            else {
                callback(404)
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

// Tokens - Put
// Required: id, extend
// Optional: None
handlers.put = function (data, callback) {
    // Validation
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false
    const extend = typeof (data.payload.extend) == 'boolean' ? data.payload.extend : false

    if (id && extend) {
        //Extend token if not expired
        tokenRepository.update(id, function (error) {
            if (!error) {
                callback(200)
            }
            else {
                callback(500, { 'error': 'Could not update token' })
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

// Token - Delete
// Required: Id
// Optional: none
handlers.delete = function (data, callback) {
    // Check that the token provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

    if (id) {
        // Delete the token
        tokenRepository.delete(id, function (error) {
            if (!error) {
                callback(200)
            }
            else {
                callback(500, { 'error': 'There was an issue deleting the token' })
            }
        })
    }
    else {
        callback(400, { 'error': 'Missing required field' })
    }
}

// Token - Verify Token: Verifies a given token is not expired and belongs to the given user
// Required - token id, user id
// Optional = none
handlers.verifyToken = function (id, userId, callback) {
    // Check that the token provided is valid
    const validId = typeof (id) == 'string' && id.trim().length == 20 ? id.trim() : false
    const validUserId = typeof (userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false

    if (validId, validUserId) {
        // Lookup the token
        tokenRepository.read(validId, function (error, tokenData) {
            if (!error && tokenData) {
                // Check if a token is for a given user and not expired
                if (tokenData.id == validUserId && tokenData.expires > Date.now()) {
                    callback(true)
                }
                else {
                    callback(false)
                }
            }
            else {
                callback(false)
            }
        })
    }
    else {
        callback(false)
    }
}

// Token - Check Expiration: Verifies that a token has not expired
// Required - token id
// Optional = none
handlers.checkExpiration = function (id, callback) {
    // Check that the token provided is valid
    const validId = typeof (id) == 'string' && id.trim().length == 20 ? id.trim() : false

    if (validId) {
        // Lookup the token
        tokenRepository.read(validId, function (error, tokenData) {
            if (!error && tokenData) {
                // Check if a token is not expired
                if (tokenData.expires > Date.now()) {
                    callback(false)
                }
                else {
                    callback(true)
                }
            }
            else {
                callback(true)
            }
        })
    }
    else {
        callback(true)
    }
}

module.exports = handlers