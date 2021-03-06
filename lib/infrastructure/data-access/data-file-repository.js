/*
* Data repository
*/

// Dependancies
const fs = require('fs')
const path = require('path')
const helpers = require('../../helpers')

// Container for the library to be exported
let lib = {}

// Base directory of the data folder
lib.baseDirectory = path.join(__dirname, '/../../../.data/')

// Write data to a file
lib.create = function(directory, file, data, callback){
    // Open file for writing
    let filePath = lib.baseDirectory+directory+'/'+file+'.json'
    fs.open(filePath, 'wx', function(error, fileDescriptor){
        if(!error && fileDescriptor){
            // Convert data to string
            let stringData = JSON.stringify(data)
            fs.writeFile(fileDescriptor, stringData, function(error){
                if(!error){
                    fs.close(fileDescriptor, function(error){
                        if(!error){
                            callback(false)
                        } 
                        else {
                            callback('Error closing new file')
                        }
                    })
                } 
                else {
                    callback('There was an issue writing to he file')
                }
            })
        } 
        else {
            callback('There was an issue creating the file, it might already exist', error)
        }
    })
}

// Read data from a file
lib.read = function(directory, file, callback){
    const cartFile = lib.baseDirectory+directory+'\\'+file+'.json';
    fs.readFile(cartFile,'utf8', function(error, data){
        if(!error && data)
        {
            const parsedJsonData = helpers.parseJsonToObject(data)
            callback(false, parsedJsonData)
        }
        else
        {
            callback(error, data)
        }
    })
}

// Update data in a file
lib.update = function(directory, file, data, callback){
        // Open file for writing
        fs.open(lib.baseDirectory+directory+'/'+file+'.json', 'r+', function(error, fileDescriptor){
            if(!error && fileDescriptor){
                // Convert data to string
                const stringData = JSON.stringify(data)
                fs.ftruncate(fileDescriptor, function(error){
                    if(!error) {
                        // Write to the file and close it
                        fs.writeFile(fileDescriptor, stringData, function(error){
                            if(!error){
                                fs.close(fileDescriptor, function(error){
                                    if(!error){
                                        callback(false)
                                    } else {
                                        callback('There was an error closing file ', file, ' while trying to update')
                                    }
                                })
                            }
                            else {
                                callback('There was an error updating the file', file)
                            }
                        })
                    }
                    else {
                        callback('There was an error truncating the file ', file)
                    }
                })
            }
            else {
                callback('File does not exist so cant update it')
            }
        })
}

// Deletes a file
lib.delete = function(directory, fileName, callback){
    //Unlink the file
    fs.unlink(lib.baseDirectory+directory+'/'+fileName+'.json', function(error){
        if(!error){
            callback(false)
        } else{
            callback('There was an error trying to delete ' + fileName)
        }
    })
}

//List all the files in a directory
lib.list = function(directory, callback){
    fs.readdir(lib.baseDirectory+directory+'/', function(error, data){
        if(!error && data.length > 0){
            let trimmedFileNames = []
            data.forEach(fileName => {
                trimmedFileNames.push(fileName.replace('.json', ''))
            })
            callback(false, trimmedFileNames)
        }
        else {
            callback(error, data)
        }
    })
}

// Export the module
module.exports = lib
