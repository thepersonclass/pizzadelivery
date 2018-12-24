class CreditCardModel{
    constructor(creditCardNumber, expirationDate, ccv){
        const parsedCreditCardNumber = parseInt(creditCardNumber)
        const validCreditCardNumber =  !isNaN(parsedCreditCardNumber) && creditCardNumber.length === 16 ? parsedCreditCardNumber : false
        const parsedExpirationDate = parseInt(expirationDate)
        const validExpirationDate = !isNaN(parsedExpirationDate) && expirationDate.length === 8 ? parsedExpirationDate : false
        const parsedCCV = parseInt(ccv)
        const validCCV = !isNaN(parsedCCV) && ccv.length >= 3 && ccv.length <= 4 ? parsedCCV : false

        if(validCreditCardNumber, validExpirationDate, validCCV){
            this.creditCardNumber = creditCardNumber
            this.expirationDate = expirationDate
            this.ccv = ccv
        }
    }
}

module.exports = CreditCardModel