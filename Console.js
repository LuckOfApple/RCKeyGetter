const c = require('chalk')

module.exports = class Console {
    constructor() {}

    dateTimePad(value, digits) {
        let number = value;
        while (number.toString().length < digits) {
            number = "0" + number;
        }
        return number;
    }
    format(tDate = new Date(Date.now())) {
        return this.dateTimePad(tDate.getHours(), 2) + ":" +
            this.dateTimePad(tDate.getMinutes(), 2) + ":" +
            this.dateTimePad(tDate.getSeconds(), 2);
    }
    log(tolog, options = null) {
        if (!options) {
            console.log(`[${this.format()}] ` + c.blue(`[LOG]`) + " || [ " + c.blue('/') + " ] " + tolog)
        } else {
            console.log(c.cyan(`[LOG] ${this.format()}- ${tolog}`), options)
        }
    }
    success(tolog, options = null) {
        if (!options) {
            console.log(`[${this.format()}] ` + c.blue(`[LOG]`) + " || [ " + c.green('+') + " ] " + tolog)
        } else {
            console.log(c.cyan(`[LOG] ${this.format()}- ${tolog}`), options)
        }
    }
    error(tolog, options = null) {
        if (!options) {
            console.log(`[${this.format()}] ` + c.blue(`[LOG]`) + " || [ " + c.red('-') + " ] " + tolog)
        } else {
            console.log(c.cyan(`[LOG] ${this.format()}- ${tolog}`), options)
        }
    }
}