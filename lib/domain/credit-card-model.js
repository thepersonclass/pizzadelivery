class CreditCardModel{
    constructor(creditCardNumber, expirationDate, ccv){
        const parsedCreditCardNumber = parseInt(creditCardNumber)
        const validCreditCardNumber =  !isNaN(parsedCreditCardNumber) && parsedCreditCardNumber.toString().length === 16 ? parsedCreditCardNumber : false
        const parsedExpirationDate = parseInt(expirationDate)
        const validExpirationDate = !isNaN(parsedExpirationDate) && parsedExpirationDate.toString().length === 8 ? parsedExpirationDate : false
        const parsedCCV = parseInt(ccv)
        const validCCV = !isNaN(parsedCCV) && ccv.toString().length >= 3 && parsedCCV.toString().length <= 4 ? parsedCCV : false

        if(validCreditCardNumber, validExpirationDate, validCCV){
            this.creditCardNumber = validCreditCardNumber
            this.expirationDate = validExpirationDate
            this.ccv = validCCV
        }
    }
}

module.exports = CreditCardModel