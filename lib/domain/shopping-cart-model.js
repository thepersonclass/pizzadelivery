let menuItemModel = require('./menu-item-model')

class ShoppingCart {
    constructor(menuItems){
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

    setCartTotal(){
        this.menuItems.forEach(menuItem => {
            this.total += menuItem.price
        });
    }

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

module.exports = ShoppingCart