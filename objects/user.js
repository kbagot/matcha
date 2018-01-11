let database = require('./config/database'),
     db = new database();
let controller = require('./request');

let User = function() {
    this.controller = new controller();
    this.name = "Motherfucker !!!!";
};

module.exports = User;

