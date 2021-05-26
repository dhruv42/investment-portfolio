function calculateTotalPrice(price,quantity) {
    return price*quantity;
}

function doAverage(total,quantity) {
    return total/quantity;
}



module.exports = {
    calculateTotalPrice,doAverage
}