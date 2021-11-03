const {randomBytes} = require("crypto");
let key;
let iv;

module.exports = {
    getKey: function () {
        if (key===undefined){
             key = randomBytes(32);
        }
        return key;
    },
    getIv: function () {

        if (iv===undefined){
             iv = randomBytes(16);
        }

        return iv;
    },
};