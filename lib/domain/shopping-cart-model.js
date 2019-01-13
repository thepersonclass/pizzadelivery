/*
* Shopping Cart Model
*/

// Dependancies
let menuItemModel = require('./menu-item-model')

//Required: Menu item(s) and userId
//Optional: None
class ShoppingCartModel {
    constructor(menuItems, userId){
        this.updateMenuItems(menuItems)
        const validUserId = typeof(userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false
        
        if(validUserId){
            this.userId = userId
        }
    }

    //Updates cart total based on the menu items in it
    setCartTotal(){
        this.menuItems.forEach(menuItem => {
            this.total += menuItem.price
        });
    }

    //Validates menu items then updates the cart total
    updateMenuItems(menuItems){
        const validMenuItems = menuItems instanceof Array && menuItems.length > 0 ? menuItems : false

        if(validMenuItems){
            let actualMenuItems = []
            menuItems.forEach(menuItem => {
                if(menuItem instanceof menuItemModel){
                    actualMenuItems.push(menuItem)
                }       
                
                if(actualMenuItems.length === menuItems.length){
                    this.menuItems = actualMenuItems
                    this.total = 0.00
                    this.setCartTotal()
                }
            })
        }
    }
}

module.exports = ShoppingCartModel