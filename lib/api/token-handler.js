const tokenRepository = require('../infrastructure/data-access/token-file-repository')
const userRepository = require('../infrastructure/data-access/user-file-repository')

// Define handlers
let handlers = {}

// Tokens handler
handlers.tokens = function (data, callback) {

    const acceptedMethods = ['post', 'get', 'put', 'delete']
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers[data.method](data, callback)
    }
    else {
        callback(405)
    }
};

handlers = {}

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
                if (hashedPassword == usersData.password) {
                    tokenRepository.create(userId, function (error) {
                        if (!error) {
                            callback(200, tokenObject);
                        }
                        else {
                            callback(500, { 'error': 'Could not create token' });
                        }
                    });
                }
                else {
                    callback(400, { 'error': 'Does not match password' });
                }
            }
            else {
                callback(400, { 'error': 'Could not find user' });
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field(s)' });
    }
};

// Tokens - Get
// Required: id
// Optional: none
handlers.get = function (data, callback) {
    // Check that the token provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the token
        tokenRepository.read(id, function (error, tokenData) {
            if (!error && tokenData) {
                callback(200, tokenData);
            }
            else {
                callback(404);
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' });
    }
};

// Tokens - Put
// Required: id, extend
// Optional: None
handlers.put = function (data, callback) {
    // Validation
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
    const extend = typeof (data.payload.extend) == 'boolean' ? data.payload.extend : false;

    if (id && extend) {
        // Lookup the token
        tokenRepository.read(id, function (error, tokenData) {
            if (!error && tokenData) {
                if (tokenData.expires > Date.now()) {
                    const expires = Date.now() + 1000 * 60 * 60;
                    tokenData.expires = expires;
                    tokenRepository.update(id, tokenData, function (error) {
                        if (!error) {
                            callback(200);
                        }
                        else {
                            callback(500, { 'error': 'Could not update token' });
                        }
                    });
                }
                else {
                    callback(400, { 'error': 'Token has not expired yet' });
                }
            }
            else {
                callback(404);
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' });
    }
};

// Token - Delete
// Required: Id
// Optional: none
handlers.delete = function (data, callback) {
    // Check that the token provided is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the token
        tokenRepository.delete(id, function (error) {
            if (!error) {
                callback(200);
            }
            else {
                callback(500, { 'error': 'There was an issue deleting the token' });
            }
        });
    }
    else {
        callback(400, { 'error': 'Missing required field' });
    }
};

// Verifies a given token
handler.verifyToken = function (id, userId, callback) {
    // Check that the token provided is valid
    const id = typeof (id) == 'string' && id.trim().length == 20 ? id.trim() : false;
    const userId = typeof (userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false;
    if (id, userId) {
        // Lookup the token
        tokenRepository.read(id, function (error, tokenData) {
            if (!error && tokenData) {
                // Check if a token is for a given user and not expired
                if (tokenData.id == userId && tokenData.expires > Date.now()) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
        });
    }
    else {
        return false;
    }
};

module.exports = handlers