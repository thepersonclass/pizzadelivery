class MenuItemModel{
    constructor(name, description, price, userId){
        const validName = typeof(name) === 'string' && name.trim().length > 0 ? name.trim() : false
        const validDescription = typeof(description) === 'string' && description.trim().length > 0 ? description.trim() : false
        const parsedPrice = parseFloat(price)
        const validPrice =  !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : false
        const validUserId = typeof(userId) == 'string' && userId.trim().length == 10 ? userId.trim() : false

        if(validName && validDescription && validPrice, validUserId){
            this.name = validName
            this.description = validDescription
            this.price = validPrice
            this.userId = validUserId
        }
    }
}

module.exports = MenuItemModel