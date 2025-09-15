function getAreaOfCircle(radius) {
    return Math.PI * radius ** 2;
}

function randomPassword() {
    return Math.trunc(Math.random() * 10000);
}

function salesTaxCalc(price, taxRate) {
    if (taxRate > 0.99999) {
        return price + (price * (taxRate / 100)); //I dont know if they would enter the taxes as a percentage or if they would do it as a decimal, so i just chose one.
    } else {
        return price + (price * taxRate)
    }
}