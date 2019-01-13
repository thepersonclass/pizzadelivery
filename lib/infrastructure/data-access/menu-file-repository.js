/*
* The menu file repository creates, reads, deletes, and updates menu items on the file system
*/

// Dependancies
const dataRepo = require('./data-file-repository')
const helpers = require('../../helpers')
let menuItemModel = require('../../domain/menu-item-model')

// Container for the library to be exported
var lib = {}

lib._menuDirectory = 'menu'

/**
 * Creates a menu item on the file system
 * @param {string} id - The menu items's Id.
 * @param {MenuItemModel} menuItem - The menu item object.
 * @param {function} callback - Error callback function.
 */
lib.create = function(menuItem, callback){
    menuItem.id = helpers.createRandomString(10)

    dataRepo.create(lib._menuDirectory, menuItem.id, menuItem, function(error){
        callback(error)
    })
}

/**
 * Read the menu item from the file system
 * @param {string} id - The menu items's Id.
 * @param {function} callback - Error callback function.
 */
lib.read = function(id, callback){
    dataRepo.read(lib._menuDirectory, id, function(error, menuData){
        if(!error && menuData){
            let menuItem = new menuItemModel(menuData.name, menuData.description, menuData.price, menuData.userId)
            callback(error, menuItem)
        }
        else{
            callback(error, menuItem)
        }
    })
}

/**
 * Updates a menu item on the file system
 * @param {string} id - The menu items's Id.
 * @param {MenuItemModel} menuItem - The menu item object.
 * @param {function} callback - Error callback function.
 */
lib.update = function(id, menuItem, callback){
    dataRepo.update(lib._menuDirectory, id, menuItem, function(error){
        callback(error)
    })
}

/**
 * Deletes the menu item from the file system
 * @param {string} id - The menu items's Id.
 * @param {function} callback - Error callback function.
 */
lib.delete = function(id, callback){
    dataRepo.delete(this._menuDirectory, id, function(error){
        callback(error)
    })
}

/**
 * Reads menu items from the file system by the given ids
 * @param {array} menuItemIds - The menu items Ids.
 * @param {function} callback - Error callback function.
 */
lib.areValidMenuItems = function(menuItemIds, callback){
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
