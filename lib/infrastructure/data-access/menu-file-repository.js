const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')
let menuItemModel = require('../../domain/menu-item-model')

// Container for the library to be exported
var lib = {}

lib._menuDirectory = 'menu'

lib.create = function(menuItem, callback){
    menuItem.id = helpers.createRandomString(10)

    dataRepo.create(lib._menuDirectory, menuItem.id, menuItem, function(error){
        callback(error)
    })
}

lib.read = function(id, callback){
    dataRepo.read(lib._menuDirectory, id, function(error, menuData){
        if(!error && menuData){
            let menuItem = new menuItemModel(menuData.name, menuData.description, menuData.price)
            callback(error, menuItem)
        }
        else{
            callback(error, menuItem)
        }
    })
}

/**
 * Updates a user on the file system
 * @param {string} id - The menu items's Id.
 */
lib.update = function(id, menuItem, callback){
    dataRepo.update(lib._menuDirectory, id, menuItem, function(error){
        callback(error)
    })
}

lib.delete = function(id, callback){
    dataRepo.delete(this._menuDirectory, id, function(error){
        callback(error)
    })
}

lib.isValidMenuItems = function(menuItemIds, callback){
    let menuItems = [];
    let menuItemsValidated = 0;
    menuItemIds.forEach(menuItemId => {
        this.read(menuItemId, (error, menuData) => {
            if(!error){
                menuItemsValidated++
                menuItems.push(menuData)
            }
            else {
                callback("Invalid menu item found", [])
            }
            
            if(menuItemsValidated == menuItemIds.length){
                callback(false, menuItems)
            }
        })
    })
}

module.exports = lib
