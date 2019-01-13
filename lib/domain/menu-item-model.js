/*
* Menu Item Model
*/

// Required: name, description, price, userId
//Optional: None
class MenuItemModel{
    constructor(name, description, price, userId){
        const validName = typeof(name) === 'string' && name.trim().length > 0 ? name.trim() : false
        const validDescription = typeof(description) === 'string' && description.trim().length > 0 ? description.trim() : false
        const parsedPrice = parseFloat(price)
        const validPrice =  !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : false

        if(validName && validDescription && validPrice){
            this.name = validName
            this.description = validDescription
            this.price = validPrice
        }
    }
}

module.exports = MenuItemModel